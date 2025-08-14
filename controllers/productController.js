import ProductsSchema from "../models/ProductsSchema.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { productResource } from "../resources/productResource.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const bufferToStream = (buffer) => {
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    return readable;
};


export const semanticSearch = async(req, res) => {
    try {
        const { query, limit = 10 } = req.query; //we can adjust the limit later

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }


        const textSearchResults = await ProductsSchema.find({ $text: { $search: query } }, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } }).limit(limit);

        //generatic like terms with ai
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); //ysing the same model as the one used in the create product function
        const prompt = `Given this search query: "${query}", generate 10-15 related search terms, synonyms, and categories that would help find relevant products. 
        Focus on:
        - Product categories
        - Common synonyms
        - Related terms
        - Brand names (if applicable)
        
        Return only the terms separated by commas, no explanations.`;

        const result = await model.generateContent(prompt);
        const semanticTerms = result.response.text().split(',').map(term => term.trim());

        //searching the database with the semantic words
        const semanticSearchQuery = {
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
                { tags: { $in: semanticTerms } },
                { searchKeywords: { $in: semanticTerms } }
            ]
        };

        const semanticResults = await ProductsSchema.find(semanticSearchQuery).limit(limit);

        // removing duplicates and sorting by relevance
        const allResults = [...textSearchResults, ...semanticResults];
        const uniqueResults = allResults.filter((product, index, self) =>
            index === self.findIndex(p => p._id.toString() === product._id.toString())
        );


        const sortedResults = uniqueResults.sort((a, b) => {
            const aScore = a.score || 0;
            const bScore = b.score || 0;
            return bScore - aScore;
        });


        res.json(productResource(sortedResults.slice(0, limit))); // just to clean up th respnse a bit
    } catch (error) {
        console.error('Semantic search error:', error);
        res.status(500).json({
            message: "Error performing semantic search",
            error: error.message
        });
    }
};

export const allProducts = async(req, res) => {
    try {
        const products = await ProductsSchema.find();

        res.status(200).json({
            data: products,
        });
    } catch (error) {
        res
            .status(400)
            .json({ message: "Error Fetching Products, check internet connection" });
    }
};




export const createProduct = async(req, res) => {
    try {
        const { name, description, price, category, tags } = req.body;

        if (!name || !price || !description || !category) {
            return res.status(400).json({ message: "Please, fill in required fields" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Product image is required" });
        }

        // Generate semantic keywords using AI
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Generate 5-8 search keywords for this product:
        Name: ${name}
        Description: ${description}
        Category: ${category}
        
        Return only the keywords separated by commas, no explanations.`;

        const result = await model.generateContent(prompt);
        const searchKeywords = result.response.text().split(',').map(keyword => keyword.trim());


        const uploadResult = await new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream({ folder: "products" },
                (err, result) => (err ? reject(err) : resolve(result))
            );
            bufferToStream(req.file.buffer).pipe(upload);
        });

        const product = await ProductsSchema.create({
            name,
            description,
            price,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            searchKeywords,
            seller: req.user._id,
            image: {
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
            },
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(401).json({ message: "Error creating product", error: error.message });
    }
};



export const deleteProduct = async(req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await ProductsSchema.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(400).json({ message: "Product does not exist" });
        }

        // Attempt to remove the product image from Cloudinary if present
        if (deletedProduct.image && deletedProduct.image.public_id) {
            try {
                await cloudinary.uploader.destroy(deletedProduct.image.public_id);
            } catch (_) {
                // Best-effort cleanup; ignore failure to delete remote image
            }
        }

        res.status(200).json({ message: "Product deleted", deletedProduct });
    } catch (error) {
        res.status(400).json({ message: "Error deleting Product", error });
        console.error(error);
    }
};

export const updateProduct = async(req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const product = await ProductsSchema.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Check if the user owns the product
        //product.user should be product.seller ---i think
        if (product.seller.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update this product",
            });
        }

        // If a new image is uploaded, replace on Cloudinary
        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const upload = cloudinary.uploader.upload_stream({ folder: "products" },
                    (err, result) => (err ? reject(err) : resolve(result))
                );
                bufferToStream(req.file.buffer).pipe(upload);
            });

            // Destroy old image
            // if (product.image ? .public_id) {
            //     try { await cloudinary.uploader.destroy(product.image.public_id); } catch (_) {}
            // }

            updates.image = {
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
            };
        }

        // Apply the updates (partial update)
        Object.assign(product, updates);
        const updatedProduct = await product.save();

        res.status(200).json({
            success: true,
            data: updatedProduct,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};