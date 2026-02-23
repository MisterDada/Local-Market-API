/**
 * Validation middleware factory using Joi.
 *
 * @param {Joi.ObjectSchema} schema - Joi schema to validate against
 * @param {"body"|"query"|"params"} source - Which part of the request to validate
 * @returns Express middleware
 */
const validate = (schema, source = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const messages = error.details.map((d) => d.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: messages,
            });
        }

        // Replace source with validated & sanitised values
        req[source] = value;
        next();
    };
};

export default validate;
