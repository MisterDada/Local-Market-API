import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";

describe("Auth Endpoints", () => {
    // Registration 

    describe("POST /api/auth/register", () => {
        it("should register a new user and return a token", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "testuser",
                    email: "test@example.com",
                    password: "password123",
                    role: "Buyer",
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("token");
            expect(res.body.data.user).toMatchObject({
                name: "testuser",
                email: "test@example.com",
                role: "Buyer",
            });
        });

        it("should reject duplicate username", async () => {
            const userData = {
                name: "duplicate_user",
                email: "first@example.com",
                password: "password123",
                role: "Seller",
            };

            await request(app).post("/api/auth/register").send(userData).expect(201);

            const res = await request(app)
                .post("/api/auth/register")
                .send({ ...userData, email: "second@example.com" });

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
        });

        it("should reject duplicate email", async () => {
            const first = {
                name: "user_one",
                email: "shared@example.com",
                password: "password123",
                role: "Buyer",
            };

            await request(app).post("/api/auth/register").send(first).expect(201);

            const res = await request(app)
                .post("/api/auth/register")
                .send({ ...first, name: "user_two" });

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 when required fields are missing", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({ name: "incomplete" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toBeDefined();
        });

        it("should return 400 for invalid role", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "baduser",
                    email: "bad@example.com",
                    password: "password123",
                    role: "Admin",
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // Login 

    describe("POST /api/auth/login", () => {
        const credentials = {
            name: "loginuser",
            email: "login@example.com",
            password: "password123",
            role: "Buyer",
        };

        it("should login an existing user and return a token", async () => {
            // Register first
            await request(app).post("/api/auth/register").send(credentials).expect(201);

            const res = await request(app)
                .post("/api/auth/login")
                .send({ name: credentials.name, password: credentials.password });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("token");
            expect(res.body.data.user.name).toBe("loginuser");
        });

        it("should return 401 for wrong password", async () => {
            await request(app).post("/api/auth/register").send(credentials).expect(201);

            const res = await request(app)
                .post("/api/auth/login")
                .send({ name: credentials.name, password: "wrongpassword" });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return 401 for non-existent user", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({ name: "ghost", password: "password123" });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 when name is missing", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({ password: "password123" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
});
