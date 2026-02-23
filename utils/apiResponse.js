/**
 * Standardised API response helpers.
 * Every endpoint should use these so the client always receives a
 * consistent { success, message, data } shape.
 */

export const successResponse = (res, data = null, message = "Success", statusCode = 200) => {
    const payload = { success: true, message };
    if (data !== null) payload.data = data;
    return res.status(statusCode).json(payload);
};

export const errorResponse = (res, message = "Something went wrong", statusCode = 500, errors = null) => {
    const payload = { success: false, message };
    if (errors) payload.errors = errors;
    return res.status(statusCode).json(payload);
};
