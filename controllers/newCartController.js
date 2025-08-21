import Cart from "../models/CartItemsSchema.js";
import ProductsSchema from "../models/ProductsSchema.js";
import newCart from "../models/newCartSchema.js";
import { CartCollection } from "../resources/newCartResource.js";

export const addToCartNew = async(req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Ensure user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        // Validate productId
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Validate if product exists in Product collection
        const product = await ProductsSchema.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if product already exists in user's cart
        let existingCartItem = await newCart.findOne({ userId: req.user._id, productId });

        if (existingCartItem) {
            // Update quantity
            existingCartItem.quantity += quantity;
            await existingCartItem.save();

            return res.status(200).json({
                success: true,
                message: "Cart updated successfully",
                data: existingCartItem
            });
        }

        // Create a new cart item
        const cartItem = await newCart.create({
            userId: req.user._id,
            productId,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            image: product.image || {},
            quantity
        });

        return res.status(201).json({
            success: true,
            message: "Item added to cart successfully",
            data: cartItem
        });

    } catch (error) {
        console.error('Add to cart error:', error);

        return res.status(500).json({
            success: false,
            message: "Could not add to cart",
            error: error.message
        });
    }
};





export const getUserCart = async(req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        const cartItems = await newCart.find({ userId: req.user._id }).populate("productId");

        return res.status(200).json({
            success: true,
            message: "Cart items retrieved successfully",
            data: CartCollection(cartItems)
        });

    } catch (error) {
        console.error("Get cart error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not retrieve cart",
            error: error.message
        });
    }
};

export const removeCartItem = async(req, res) => {
    try {
        const { cartItemId } = req.params;

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        const deletedItem = await newCart.findOneAndDelete({ _id: cartItemId, userId: req.user._id });

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Item removed from cart successfully"
        });

    } catch (error) {
        console.error("Remove cart item error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not remove item from cart",
            error: error.message
        });
    }
};


export const clearUserCart = async(req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        await newCart.deleteMany({ userId: req.user._id });

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully"
        });

    } catch (error) {
        console.error("Clear cart error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not clear cart",
            error: error.message
        });
    }
};