import AppError from "../utils/AppError.js";

/**
 * Global error-handler.
 * Must be registered AFTER all routes.
 *
 * Handles:
 *  - AppError (operational errors we threw on purpose)
 *  - Mongoose ValidationError
 *  - Mongoose CastError (invalid ObjectId)
 *  - JWT errors
 *  - Multer errors
 *  - Everything else (500)
 */
const errorHandler = (err, _req, res, _next) => {
    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";
    let status = err.status || "error";

    //   Mongoose validation error 
    if (err.name === "ValidationError") {
        statusCode = 400;
        status = "fail";
        const messages = Object.values(err.errors).map((e) => e.message);
        message = messages.join(". ");
    }

    //   Mongoose bad ObjectId 
    if (err.name === "CastError") {
        statusCode = 400;
        status = "fail";
        message = `Invalid ${err.path}: ${err.value}`;
    }

    //   Mongoose duplicate key 
    if (err.code === 11000) {
        statusCode = 409;
        status = "fail";
        const field = Object.keys(err.keyValue).join(", ");
        message = `Duplicate value for: ${field}`;
    }

    //   JWT errors 
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        status = "fail";
        message = "Invalid token. Please log in again.";
    }
    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        status = "fail";
        message = "Token expired. Please log in again.";
    }

    //   Multer errors 
    if (err.name === "MulterError") {
        statusCode = 400;
        status = "fail";
        if (err.code === "LIMIT_FILE_SIZE") {
            message = "File too large. Maximum size is 5MB.";
        }
    }

    // Log unexpected errors in development
    if (statusCode === 500) {
        console.error("UNHANDLED ERROR:", err);
    }

    res.status(statusCode).json({
        success: false,
        status,
        message,
        // Only include stack trace in development
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

export default errorHandler;
