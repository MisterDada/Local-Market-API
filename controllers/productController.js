import ProductsSchema from "../models/ProductsSchema.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";
import { error } from "console";

const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
};

export const allProducts = async (req, res) => {
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
//add validators later
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !price || !description || !category) {
      return res
        .status(400)
        .json({ message: "Please, fill in required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    // Uwe handle the cloudinary stuff from here
    const uploadResult = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      bufferToStream(req.file.buffer).pipe(upload);
    });

    const product = await ProductsSchema.create({
      name,
      description,
      price,
      category,
      seller: req.user._id,
      image: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Error creating product", error });
  }
};

export const deleteProduct = async (req, res) => {
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

export const updateProduct = async (req, res) => {
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
        const upload = cloudinary.uploader.upload_stream(
          { folder: "products" },
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
