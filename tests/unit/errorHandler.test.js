import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import errorHandler from "../../middleware/errorHandler.js";
import AppError from "../../utils/AppError.js";

/**
 * Helper: create mock res object that captures the response.
 */
const mockRes = () => {
    const res = {
        statusCode: null,
        body: null,
        status(code) {
            res.statusCode = code;
            return res;
        },
        json(data) {
            res.body = data;
            return res;
        },
    };
    return res;
};

const mockReq = {};
const mockNext = () => { };

describe("errorHandler middleware", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
    });

    it("should handle AppError with correct status code", () => {
        const err = new AppError("Not found", 404);
        const res = mockRes();

        errorHandler(err, mockReq, res, mockNext);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Not found");
        expect(res.body.status).toBe("fail");
    });

    it("should handle Mongoose ValidationError", () => {
        const err = new Error("Validation failed");
        err.name = "ValidationError";
        err.errors = {
            name: { message: "Name is required" },
            price: { message: "Price must be positive" },
        };
        const res = mockRes();

        errorHandler(err, mockReq, res, mockNext);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Name is required");
        expect(res.body.message).toContain("Price must be positive");
    });

    it("should handle Mongoose CastError", () => {
        const err = new Error("Cast failed");
        err.name = "CastError";
        err.path = "_id";
        err.value = "invalid-id";
        const res = mockRes();

        errorHandler(err, mockReq, res, mockNext);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Invalid _id");
    });

    it("should handle duplicate key error (code 11000)", () => {
        const err = new Error("Duplicate");
        err.code = 11000;
        err.keyValue = { email: "dup@test.com" };
        const res = mockRes();

        errorHandler(err, mockReq, res, mockNext);

        expect(res.statusCode).toBe(409);
        expect(res.body.message).toContain("email");
    });

    it("should handle JsonWebTokenError", () => {
        const err = new Error("invalid token");
        err.name = "JsonWebTokenError";
        const res = mockRes();

        errorHandler(err, mockReq, res, mockNext);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toContain("Invalid token");
    });

    it("should handle TokenExpiredError", () => {
        const err = new Error("jwt expired");
        err.name = "TokenExpiredError";
        const res = mockRes();

        errorHandler(err, mockReq, res, mockNext);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toContain("expired");
    });

    it("should default to 500 for unknown errors", () => {
        const err = new Error("Something broke");
        const res = mockRes();

        errorHandler(err, mockReq, res, mockNext);

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });

    it("should include stack trace in development", () => {
        process.env.NODE_ENV = "development";
        const err = new AppError("Dev error", 400);
        const res = mockRes();

        errorHandler(err, mockReq, res, mockNext);

        expect(res.body.stack).toBeDefined();
    });

    it("should hide stack trace in production", () => {
        process.env.NODE_ENV = "production";
        const err = new AppError("Prod error", 400);
        const res = mockRes();

        errorHandler(err, mockReq, res, mockNext);

        expect(res.body.stack).toBeUndefined();
    });
});
