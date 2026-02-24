import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { createSeller, createBuyer, createProduct } from "../helpers.js";

describe("Cart Endpoints", () => {
    let buyerToken;
    let productId;

    //  Setup: create a seller, a product, and a buyer 

    const setupCartData = async () => {
        const seller = await createSeller();
        const product = await createProduct(seller.token, { name: "Cart Item", price: "25.00" });
        const buyer = await createBuyer();
        return { productId: product._id, buyerToken: buyer.token };
    };

    //  Add To Cart 

    describe("POST /api/cart/add", () => {
        it("should add an item to the cart", async () => {
            const { productId, buyerToken } = await setupCartData();

            const res = await request(app)
                .post("/api/cart/add")
                .set("Authorization", `Bearer ${buyerToken}`)
                .send({ productId, quantity: 2 });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.items).toHaveLength(1);
        });

        it("should increment quantity when adding same product", async () => {
            const { productId, buyerToken } = await setupCartData();

            await request(app)
                .post("/api/cart/add")
                .set("Authorization", `Bearer ${buyerToken}`)
                .send({ productId, quantity: 1 });

            const res = await request(app)
                .post("/api/cart/add")
                .set("Authorization", `Bearer ${buyerToken}`)
                .send({ productId, quantity: 3 });

            expect(res.status).toBe(200);
            // Total quantity should be 1 + 3 = 4
            const item = res.body.data.items.find(
                (i) => (i.product?._id || i.product) === productId
            );
            expect(item.quantity).toBe(4);
        });

        it("should return 404 for non-existent product", async () => {
            const buyer = await createBuyer();
            const fakeId = "dadaisaboy";

            const res = await request(app)
                .post("/api/cart/add")
                .set("Authorization", `Bearer ${buyer.token}`)
                .send({ productId: fakeId, quantity: 1 });

            expect(res.status).toBe(404);
        });

        it("should return 401 without authentication", async () => {
            const res = await request(app)
                .post("/api/cart/add")
                .send({ productId: "dadaisaboy", quantity: 1 });

            expect(res.status).toBe(401);
        });
    });

    //  Get Cart 

    describe("GET /api/cart", () => {
        it("should return an empty cart for a new user", async () => {
            const buyer = await createBuyer();

            const res = await request(app)
                .get("/api/cart")
                .set("Authorization", `Bearer ${buyer.token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.items).toEqual([]);
            expect(res.body.data.total).toBe(0);
        });

        it("should return cart with items and correct total", async () => {
            const { productId, buyerToken } = await setupCartData();

            await request(app)
                .post("/api/cart/add")
                .set("Authorization", `Bearer ${buyerToken}`)
                .send({ productId, quantity: 2 });

            const res = await request(app)
                .get("/api/cart")
                .set("Authorization", `Bearer ${buyerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.items).toHaveLength(1);
            expect(res.body.data.total).toBe(50); // 25.00 * 2
            expect(res.body.data.itemCount).toBe(2);
        });
    });

    //  Update Cart Item 

    describe("PATCH /api/cart/update/:productId", () => {
        it("should update item quantity", async () => {
            const { productId, buyerToken } = await setupCartData();

            await request(app)
                .post("/api/cart/add")
                .set("Authorization", `Bearer ${buyerToken}`)
                .send({ productId, quantity: 1 });

            const res = await request(app)
                .patch(`/api/cart/update/${productId}`)
                .set("Authorization", `Bearer ${buyerToken}`)
                .send({ quantity: 5 });

            expect(res.status).toBe(200);
        });

        it("should return 404 for item not in cart", async () => {
            const buyer = await createBuyer();
            const fakeId = "dadaisaboy";

            // Create an empty cart first by adding then removing, or just try to update
            const res = await request(app)
                .patch(`/api/cart/update/${fakeId}`)
                .set("Authorization", `Bearer ${buyer.token}`)
                .send({ quantity: 1 });

            expect(res.status).toBe(404);
        });
    });

    //  Remove From Cart 

    describe("DELETE /api/cart/remove/:productId", () => {
        it("should remove an item from the cart", async () => {
            const { productId, buyerToken } = await setupCartData();

            await request(app)
                .post("/api/cart/add")
                .set("Authorization", `Bearer ${buyerToken}`)
                .send({ productId, quantity: 1 });

            const res = await request(app)
                .delete(`/api/cart/remove/${productId}`)
                .set("Authorization", `Bearer ${buyerToken}`);

            expect(res.status).toBe(200);
        });
    });

    //  Clear Cart 

    describe("DELETE /api/cart/clear", () => {
        it("should clear all items from the cart", async () => {
            const { productId, buyerToken } = await setupCartData();

            await request(app)
                .post("/api/cart/add")
                .set("Authorization", `Bearer ${buyerToken}`)
                .send({ productId, quantity: 3 });

            const res = await request(app)
                .delete("/api/cart/clear")
                .set("Authorization", `Bearer ${buyerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.items).toEqual([]);
            expect(res.body.data.total).toBe(0);
        });
    });
});
