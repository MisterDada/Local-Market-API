import Cart from "../models/CartItemsSchema.js";
import ProductsSchema from "../models/ProductsSchema.js";
import { CartResource } from "../resources/cartResources.js";

export const addToCart = async(req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user._id;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Validate product exists
        const product = await ProductsSchema.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // Create new cart if no exists
            cart = await Cart.create({
                user: userId,
                items: [{ product: productId, quantity }]
            });
        } else {
            // Check if product already exist
            const existingItemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (existingItemIndex > -1) {
                // to update quantity
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                // Add new item to cart
                cart.items.push({ product: productId, quantity });
            }

            await cart.save();
        }

        // Populate product details for response
        await cart.populate('items.product', 'name price image category');

        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            data: cart
        });

    } catch (error) {
        // console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: "Could not add to cart",
            error: error.message
        });
    }
};


// export const getCart = async(req, res) => {
//     try {
//         const userId = req.user._id;

//         const cart = await Cart.findOne({ user: userId })
//             .populate('items.product', 'name price image category description');

//         if (!cart) {
//             return res.status(200).json({
//                 success: true,
//                 data: { items: [], total: 0, itemCount: 0 },
//                 message: "Cart is empty"
//             });
//         }

//         // Calculate total price
//         const total = cart.items.reduce((sum, item) => {
//             return sum + (item.product.price * item.quantity);
//         }, 0);

//         const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

//         res.status(200).json({
//             success: true,
//             data: {
//                 items: cart.items,
//                 total: total.toFixed(2),
//                 itemCount: itemCount
//             }
//         });

//     } catch (error) {
//         console.error('Get cart error:', error);
//         res.status(500).json({
//             success: false,
//             message: "Could not fetch cart",
//             error: error.message
//         });
//     }
// };


export const getCart = async(req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId })
            .populate('items.product', 'name price image category description');

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: { items: [], total: 0, itemCount: 0 },
                message: "Cart is empty"
            });
        }

        const total = cart.items.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);

        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

        res.status(200).json({
            success: true,
            data: CartResource(cart, total, itemCount)
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: "Could not fetch cart",
            error: error.message
        });
    }
};

export const updateCartItem = async(req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const userId = req.user._id;

        if (!quantity || quantity < 1) { //just add the twi check together
            return res.status(400).json({
                success: false,
                message: "Valid quantity is required"
            });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) { //check if item already exists in the cart
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        // Update quantity
        cart.items[itemIndex].quantity = quantity;
        await cart.save();


        await cart.populate('items.product', 'name price image category');

        res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: cart
        });

    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: "Could not update cart item",
            error: error.message
        });
    }
};


export const removeFromCart = async(req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        // Remove item
        cart.items.splice(itemIndex, 1);
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Item removed from cart successsfully",
            data: cart
        });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: "Could not remove item from cart",
            error: error.message
        });
    }
};

// Clear entire cart
export const clearCart = async(req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            data: { items: [], total: 0, itemCount: 0 }
        });

    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: "Could not clear cart",
            error: error.message
        });
    }
};