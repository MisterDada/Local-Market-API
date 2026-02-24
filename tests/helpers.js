import request from "supertest";
import app from "../app.js";

let sellerCounter = 0;
let buyerCounter = 0;

/**
 * Register a Seller user and return { user, token }.
 */
export const createSeller = async (overrides = {}) => {
    sellerCounter++;
    const data = {
        name: `seller${sellerCounter}_${Date.now()}`,
        email: `seller${sellerCounter}_${Date.now()}@test.com`,
        password: "password123",
        role: "Seller",
        ...overrides,
    };

    const res = await request(app)
        .post("/api/auth/register")
        .send(data)
        .expect(201);

    return { user: res.body.data.user, token: res.body.data.token };
};

/**
 * Register a Buyer user and return { user, token }.
 */
export const createBuyer = async (overrides = {}) => {
    buyerCounter++;
    const data = {
        name: `buyer${buyerCounter}_${Date.now()}`,
        email: `buyer${buyerCounter}_${Date.now()}@test.com`,
        password: "password123",
        role: "Buyer",
        ...overrides,
    };

    const res = await request(app)
        .post("/api/auth/register")
        .send(data)
        .expect(201);

    return { user: res.body.data.user, token: res.body.data.token };
};

/**
 * Create a product as the given seller.
 * Uses a tiny 1x1 PNG as the required image.
 */
export const createProduct = async (token, overrides = {}) => {
    const {
        name = "Test Product",
        description = "A test product description",
        price = "29.99",
        category = "Electronics",
        tags = "test,product",
    } = overrides;

    // Minimal valid PNG (1x1 pixel)
    const tinyPng = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
    );

    const res = await request(app)
        .post("/api/products/createProduct")
        .set("Authorization", `Bearer ${token}`)
        .field("name", name)
        .field("description", description)
        .field("price", price)
        .field("category", category)
        .field("tags", tags)
        .attach("file", tinyPng, "test.png")
        .expect(201);

    return res.body.data;
};
