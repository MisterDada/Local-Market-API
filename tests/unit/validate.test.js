import { describe, it, expect, vi } from "vitest";
import Joi from "joi";
import validate from "../../middleware/validate.js";

/**
 * Helper: simulate calling the middleware with a request.
 */
const callMiddleware = (middleware, req) => {
    return new Promise((resolve) => {
        const res = {
            statusCode: null,
            body: null,
            status(code) {
                res.statusCode = code;
                return res;
            },
            json(data) {
                res.body = data;
                resolve({ type: "response", res });
                return res;
            },
        };

        const next = () => resolve({ type: "next", req });

        middleware(req, res, next);
    });
};

describe("validate middleware", () => {
    const schema = Joi.object({
        name: Joi.string().min(2).required(),
        age: Joi.number().integer().positive().required(),
    });

    it("should call next() and set sanitised values on valid input", async () => {
        const req = { body: { name: "Alice", age: 30, extra: "ignored" } };
        const result = await callMiddleware(validate(schema), req);

        expect(result.type).toBe("next");
        // stripUnknown should remove the extra field
        expect(result.req.body).toEqual({ name: "Alice", age: 30 });
        expect(result.req.body.extra).toBeUndefined();
    });

    it("should return 400 with error messages on invalid input", async () => {
        const req = { body: { name: "A" } }; // name too short, age missing
        const result = await callMiddleware(validate(schema), req);

        expect(result.type).toBe("response");
        expect(result.res.statusCode).toBe(400);
        expect(result.res.body.success).toBe(false);
        expect(result.res.body.message).toBe("Validation failed");
        expect(result.res.body.errors).toBeInstanceOf(Array);
        expect(result.res.body.errors.length).toBeGreaterThanOrEqual(2);
    });

    it("should validate query params when source is 'query'", async () => {
        const querySchema = Joi.object({
            search: Joi.string().required(),
        });

        const req = { query: { search: "test", junk: "removed" } };
        const result = await callMiddleware(validate(querySchema, "query"), req);

        expect(result.type).toBe("next");
        expect(result.req.query).toEqual({ search: "test" });
    });

    it("should validate params when source is 'params'", async () => {
        const paramSchema = Joi.object({
            id: Joi.string().hex().length(24).required(),
        });

        const req = { params: { id: "aaaaaaaaaaaaaaaaaaaaaaaa" } };
        const result = await callMiddleware(validate(paramSchema, "params"), req);

        expect(result.type).toBe("next");
    });

    it("should return errors when params are invalid", async () => {
        const paramSchema = Joi.object({
            id: Joi.string().hex().length(24).required(),
        });

        const req = { params: { id: "bad" } };
        const result = await callMiddleware(validate(paramSchema, "params"), req);

        expect(result.type).toBe("response");
        expect(result.res.statusCode).toBe(400);
    });
});
