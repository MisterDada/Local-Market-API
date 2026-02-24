import { describe, it, expect } from "vitest";
import AppError from "../../utils/AppError.js";

describe("AppError", () => {
    it("should set statusCode and message", () => {
        const err = new AppError("Not found", 404);

        expect(err.message).toBe("Not found");
        expect(err.statusCode).toBe(404);
    });

    it('should set status to "fail" for 4xx codes', () => {
        const err = new AppError("Bad request", 400);
        expect(err.status).toBe("fail");

        const err2 = new AppError("Forbidden", 403);
        expect(err2.status).toBe("fail");
    });

    it('should set status to "error" for 5xx codes', () => {
        const err = new AppError("Server error", 500);
        expect(err.status).toBe("error");
    });

    it("should mark the error as operational", () => {
        const err = new AppError("Operational", 400);
        expect(err.isOperational).toBe(true);
    });

    it("should be an instance of Error", () => {
        const err = new AppError("Test", 500);
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(AppError);
    });

    it("should capture a stack trace", () => {
        const err = new AppError("Stack check", 500);
        expect(err.stack).toBeDefined();
        expect(err.stack).toContain("Stack check");
    });
});
