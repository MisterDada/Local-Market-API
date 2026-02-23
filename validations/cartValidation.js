import Joi from "joi";

export const addToCartSchema = Joi.object({
    productId: Joi.string().hex().length(24).required()
        .messages({ "any.required": "Product ID is required" }),
    quantity: Joi.number().integer().min(1).default(1),
});

export const updateCartItemSchema = Joi.object({
    quantity: Joi.number().integer().min(1).required()
        .messages({ "any.required": "Valid quantity is required" }),
});

export const cartItemIdParamSchema = Joi.object({
    productId: Joi.string().hex().length(24).required(),
});
