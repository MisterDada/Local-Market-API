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
    res.status(401).json({message: "Error creating product"})
  }
};


export const addProduct = async (req, res) => {
    
}