import express from "express";
import { addToCart, getCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cartController.js";
import VerifyToken from "../middleware/AuthMiddleware.js";
const router = express.Router();

router.post('/add', VerifyToken, addToCart);
router.get('/', VerifyToken, getCart);
router.patch("/update/:productId", VerifyToken, updateCartItem);
router.delete("/remove/:productId", VerifyToken, removeFromCart);
router.delete("/clear", VerifyToken, clearCart);
export default router;