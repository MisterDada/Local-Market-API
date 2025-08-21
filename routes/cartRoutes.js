import express from "express";
// import { addToCart, getCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cartController.js";
import { addToCartNew, getUserCart, removeCartItem, clearUserCart } from "../controllers/newCartController.js";
import VerifyToken from "../middleware/AuthMiddleware.js";
const router = express.Router();

// router.post('/add', VerifyToken, addToCart);
// router.get('/', VerifyToken, getCart);
// router.patch("/update/:productId", VerifyToken, updateCartItem);
// router.delete("/remove/:productId", VerifyToken, removeFromCart);
// router.delete("/clear", VerifyToken, clearCart);

router.post("/new/add", VerifyToken, addToCartNew);
router.get("/new", VerifyToken, getUserCart);
router.delete("/new/clear", VerifyToken, clearUserCart);
router.delete("/new/:cartItemId", VerifyToken, removeCartItem);



export default router;