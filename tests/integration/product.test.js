import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { createSeller, createBuyer, createProduct } from "../helpers.js";

describe("Product Endpoints", () => {
    // ── Get All Products ──────────────────────────────────────────

    describe("GET /api/products/allProducts", () => {
        it("should return an empty array when no products exist", async () => {
            const res = await request(app).get("/api/products/allProducts");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
        });

        it("should return all products", async () => {
            const { token } = await createSeller();
            await createProduct(token, { name: "Product A" });
            await createProduct(token, { name: "Product B" });

            const res = await request(app).get("/api/products/allProducts");

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(2);
        });
    });

    // ── Get Product By ID ─────────────────────────────────────────

    describe("GET /api/products/:id", () => {
        it("should return a product by ID", async () => {
            const { token } = await createSeller();
            const product = await createProduct(token);

            const res = await request(app).get(`/api/products/${product._id}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe("Test Product");
        });

        it("should return 404 for non-existent product", async () => {
            const fakeId = "aaaaaaaaaaaaaaaaaaaaaaaa";
            const res = await request(app).get(`/api/products/${fakeId}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 for invalid ID format", async () => {
            const res = await request(app).get("/api/products/not-a-valid-id");

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ── Create Product ────────────────────────────────────────────

    describe("POST /api/products/createProduct", () => {
        it("should create a product as a Seller", async () => {
            const { token } = await createSeller();
            const product = await createProduct(token, { name: "New Gadget" });

            expect(product).toBeDefined();
            expect(product.name).toBe("New Gadget");
            expect(product.imageStatus).toBe("pending");
        });

        it("should return 400 when image is missing", async () => {
            const { token } = await createSeller();

            const res = await request(app)
                .post("/api/products/createProduct")
                .set("Authorization", `Bearer ${token}`)
                .field("name", "No Image Product")
                .field("description", "Missing image")
                .field("price", "10")
                .field("category", "Test");

            expect(res.status).toBe(400);
        });

        it("should return 403 when a Buyer tries to create", async () => {
            const { token } = await createBuyer();

            const tinyPng = Buffer.from(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
                "base64"
            );

            const res = await request(app)
                .post("/api/products/createProduct")
                .set("Authorization", `Bearer ${token}`)
                .field("name", "Buyer Product")
                .field("description", "Should fail")
                .field("price", "10")
                .field("category", "Test")
                .attach("file", tinyPng, "test.png");

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("should return 401 without authentication", async () => {
            const res = await request(app)
                .post("/api/products/createProduct")
                .field("name", "Unauth Product")
                .field("description", "No token")
                .field("price", "10")
                .field("category", "Test");

            expect(res.status).toBe(401);
        });
    });

    // ── Update Product ────────────────────────────────────────────

    describe("PATCH /api/products/updateProduct/:id", () => {
        it("should update a product by its owner", async () => {
            const { token } = await createSeller();
            const product = await createProduct(token);

            const res = await request(app)
                .patch(`/api/products/updateProduct/${product._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Updated Name" });

            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe("Updated Name");
        });

        it("should return 403 when a different seller tries to update", async () => {
            const seller1 = await createSeller();
            const seller2 = await createSeller();
            const product = await createProduct(seller1.token);

            const res = await request(app)
                .patch(`/api/products/updateProduct/${product._id}`)
                .set("Authorization", `Bearer ${seller2.token}`)
                .send({ name: "Hijacked" });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    // ── Delete Product ────────────────────────────────────────────

    describe("DELETE /api/products/deleteProduct/:id", () => {
        it("should delete a product", async () => {
            const { token } = await createSeller();
            const product = await createProduct(token);

            const res = await request(app)
                .delete(`/api/products/deleteProduct/${product._id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify it's gone
            const check = await request(app).get(`/api/products/${product._id}`);
            expect(check.status).toBe(404);
        });

        it("should return 404 when deleting non-existent product", async () => {
            const { token } = await createSeller();
            const fakeId = "aaaaaaaaaaaaaaaaaaaaaaaa";

            const res = await request(app)
                .delete(`/api/products/deleteProduct/${fakeId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(404);
        });
    });
});
