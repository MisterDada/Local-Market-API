import ProductsSchema from "../models/ProductsSchema.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { successResponse } from "../utils/apiResponse.js";
import { uploadImage, deleteImage } from "../services/cloudinaryService.js";
import { generateSearchKeywords, expandSearchQuery } from "../services/aiService.js";
import { productResource } from "../resources/productResource.js";

// Semantic Search 

export const semanticSearch = asyncHandler(async (req, res) => {
  const { query, limit = 10 } = req.query;

  // Text-index search
  const textSearchResults = await ProductsSchema.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit);

  // Expand query with AI-generated terms
  const semanticTerms = await expandSearchQuery(query);

  // Search with expanded terms
  const semanticSearchQuery = {
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } },
      { tags: { $in: semanticTerms } },
      { searchKeywords: { $in: semanticTerms } },
    ],
  };

  const semanticResults = await ProductsSchema.find(semanticSearchQuery).limit(limit);

  // Deduplicate and sort by relevance
  const seen = new Set();
  const uniqueResults = [...textSearchResults, ...semanticResults].filter((product) => {
    const id = product._id.toString();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const sortedResults = uniqueResults
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);

  return res.json(productResource(sortedResults));
});

//  Get All Products 
export const allProducts = asyncHandler(async (req, res) => {
  const products = await ProductsSchema.find().select("-__v");
  return successResponse(res, products);
});

// Get Product By ID 
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await ProductsSchema.findById(id)
    .populate("seller", "name email")
    .select("-__v");

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return successResponse(res, product);
});

// Create Product 
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, tags } = req.body;

  if (!req.file) {
    throw new AppError("Product image is required", 400);
  }

  const product = await ProductsSchema.create({
    name,
    description,
    price,
    category,
    tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
    searchKeywords: [],
    image: { url: "", public_id: "" },
    imageStatus: "pending",
    keywordStatus: "pending",
    seller: req.user._id,
  });

  // Respond immediately; process heavy tasks in background
  successResponse(
    res,
    product,
    "Product created successfully. Image upload and keyword generation are processing in the background.",
    201
  );

  // background processing
  processProductInBackground(product._id, req.file.buffer, name, description, category);
});

/**
 * Background processing: upload image + generate AI keywords.
 * Runs after the response has been sent to the client.
 */
const processProductInBackground = async (productId, imageBuffer, name, description, category) => {
  try {
    console.log(`[BG] Starting processing for product: ${productId}`);

    await ProductsSchema.findByIdAndUpdate(productId, {
      imageStatus: "processing",
      keywordStatus: "processing",
    });

    const [imageResult, keywordResult] = await Promise.allSettled([
      uploadImage(imageBuffer),
      generateSearchKeywords(name, description, category),
    ]);

    // Handle image upload result
    if (imageResult.status === "fulfilled") {
      await ProductsSchema.findByIdAndUpdate(productId, {
        image: {
          url: imageResult.value.secure_url,
          public_id: imageResult.value.public_id,
        },
        imageStatus: "completed",
        imageUploadedAt: new Date(),
      });
      console.log(`[BG] Image uploaded for product ${productId}`);
    } else {
      console.error(`[BG] Image upload failed for ${productId}:`, imageResult.reason);
      await ProductsSchema.findByIdAndUpdate(productId, { imageStatus: "failed" });
    }

    // Handle keyword generation result
    if (keywordResult.status === "fulfilled") {
      await ProductsSchema.findByIdAndUpdate(productId, {
        searchKeywords: keywordResult.value,
        keywordStatus: "completed",
        keywordsGeneratedAt: new Date(),
      });
      console.log(`[BG] Keywords generated for product ${productId}`);
    } else {
      console.error(`[BG] Keyword generation failed for ${productId}:`, keywordResult.reason);
      await ProductsSchema.findByIdAndUpdate(productId, { keywordStatus: "failed" });
    }

    console.log(`[BG] Processing completed for product ${productId}`);
  } catch (error) {
    console.error(`[BG] Critical error for product ${productId}:`, error);
    await ProductsSchema.findByIdAndUpdate(productId, {
      imageStatus: "failed",
      keywordStatus: "failed",
    });
  }
};

//  ─ Delete Product 
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedProduct = await ProductsSchema.findByIdAndDelete(id);
  if (!deletedProduct) {
    throw new AppError("Product not found", 404);
  }

  // Best-effort cleanup of remote image
  if (deletedProduct.image?.public_id) {
    await deleteImage(deletedProduct.image.public_id);
  }

  return successResponse(res, deletedProduct, "Product deleted successfully");
});

//  ─ Update Product 
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const product = await ProductsSchema.findById(id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Ownership check
  if (product.seller.toString() !== req.user._id.toString()) {
    throw new AppError("You are not allowed to update this product", 403);
  }

  // Handle image replacement if a new file was uploaded
  if (req.file) {
    const uploadResult = await uploadImage(req.file.buffer);

    // Clean up old image
    if (product.image?.public_id) {
      await deleteImage(product.image.public_id);
    }

    updates.image = {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
  }

  // Apply partial update
  Object.assign(product, updates);
  const updatedProduct = await product.save();

  return successResponse(res, updatedProduct, "Product updated successfully");
});
