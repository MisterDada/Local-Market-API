import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required()
        .messages({ "any.required": "Please enter a username" }),
    email: Joi.string().email().required()
        .messages({ "any.required": "Enter a valid email" }),
    password: Joi.string().min(6).max(128).required()
        .messages({ "any.required": "Enter a valid password" }),
    role: Joi.string().valid("Seller", "Buyer").required()
        .messages({ "any.required": "Select a valid role, either Seller or Buyer" }),
});

export const loginSchema = Joi.object({
    name: Joi.string().trim().required()
        .messages({ "any.required": "Username is required" }),
    password: Joi.string().required()
        .messages({ "any.required": "Password is required" }),
});
