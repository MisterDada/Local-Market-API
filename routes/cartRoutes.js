import express from "express";
import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from "../controllers/cartController.js";
import VerifyToken from "../middleware/AuthMiddleware.js";
import validate from "../middleware/validate.js";
import {
    addToCartSchema,
    updateCartItemSchema,
    cartItemIdParamSchema,
} from "../validations/cartValidation.js";

const router = express.Router();

// All cart routes require authentication
router.use(VerifyToken);

router.post("/add", validate(addToCartSchema), addToCart);
router.get("/", getCart);
router.patch("/update/:productId", validate(cartItemIdParamSchema, "params"), validate(updateCartItemSchema), updateCartItem);
router.delete("/remove/:productId", validate(cartItemIdParamSchema, "params"), removeFromCart);
router.delete("/clear", clearCart);

export default router;