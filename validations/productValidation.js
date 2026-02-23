import Joi from "joi";

export const createProductSchema = Joi.object({
    name: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().min(1).max(2000).required(),
    price: Joi.number().positive().required(),
    category: Joi.string().trim().min(1).max(100).required(),
    tags: Joi.string().optional().allow(""),
});

export const updateProductSchema = Joi.object({
    name: Joi.string().trim().min(1).max(200),
    description: Joi.string().trim().min(1).max(2000),
    price: Joi.number().positive(),
    category: Joi.string().trim().min(1).max(100),
    tags: Joi.string().optional().allow(""),
}).min(1); // At least one field must be provided

export const searchQuerySchema = Joi.object({
    query: Joi.string().trim().min(1).required()
        .messages({ "any.required": "Search query is required" }),
    limit: Joi.number().integer().min(1).max(100).default(10),
});

export const idParamSchema = Joi.object({
    id: Joi.string().hex().length(24).required()
        .messages({ "any.required": "Valid ID is required" }),
});
