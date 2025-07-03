import ProductsSchema from "../models/ProductsSchema.js";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    if (!name || !price || !description) {
      return res
        .status(400)
        .json({ message: "PLease, fill in required fields" });
    }

    const product = await ProductsSchema.create({
      name,
      description,
      price,
      seller: req.user._id,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(401).json({ message: "Error creating product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await ProductsSchema.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(400).json({ message: "Product does not exist" });
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

    if (product.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this product",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

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
