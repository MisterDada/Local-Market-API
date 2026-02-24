import Cart from "../models/CartItemsSchema.js";
import ProductsSchema from "../models/ProductsSchema.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { successResponse } from "../utils/apiResponse.js";
import { CartResource } from "../resources/cartResources.js";

//  ─ Add To Cart                      ─
/**
 * POST /api/cart/add
 */
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user._id;

    // Validate product exists
    const product = await ProductsSchema.findById(productId);
    if (!product) {
        throw new AppError("Product not found", 404);
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        // Create new cart
        cart = await Cart.create({
            user: userId,
            items: [{ product: productId, quantity }],
        });
    } else {
        // Check if product already in cart
        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
    }

    // Populate product details for response
    await cart.populate("items.product", "name price image category");

    return successResponse(res, cart, "Item added to cart successfully");
});

//  ─ Get Cart                        
/**
 * GET /api/cart
 */
export const getCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate(
        "items.product",
        "name price image category description"
    );

    if (!cart || cart.items.length === 0) {
        return successResponse(res, { items: [], total: 0, itemCount: 0 }, "Cart is empty");
    }

    const total = cart.items.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
    }, 0);

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return successResponse(res, CartResource(cart, total, itemCount));
});

//  ─ Update Cart Item                    
/**
 * PATCH /api/cart/update/:productId
 */
export const updateCartItem = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new AppError("Cart not found", 404);
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
        throw new AppError("Item not found in cart", 404);
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    await cart.populate("items.product", "name price image category");

    return successResponse(res, cart, "Cart item updated successfully");
});

//  ─ Remove From Cart                    
/**
 * DELETE /api/cart/remove/:productId
 */
export const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new AppError("Cart not found", 404);
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
        throw new AppError("Item not found in cart", 404);
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    return successResponse(res, cart, "Item removed from cart successfully");
});

//  ─ Clear Cart                       
/**
 * DELETE /api/cart/clear
 */
export const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new AppError("Cart not found", 404);
    }

    cart.items = [];
    await cart.save();

    return successResponse(res, { items: [], total: 0, itemCount: 0 }, "Cart cleared successfully");
});