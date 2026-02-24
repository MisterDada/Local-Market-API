import { beforeAll, afterEach, afterAll, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

//   dummy environment variables before app loads 
process.env.JWT_SECRET = "test-jwt-secret-key";
process.env.NODE_ENV = "test";
process.env.GOOGLE_API_KEY = "test-google-key";
process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
process.env.CLOUDINARY_API_KEY = "test-key";
process.env.CLOUDINARY_API_SECRET = "test-secret";

//   Mock external services 

// Cloudinary – prevent real uploads
vi.mock("../services/cloudinaryService.js", () => ({
    uploadImage: vi.fn().mockResolvedValue({
        secure_url: "https://res.cloudinary.com/test/image/upload/test.jpg",
        public_id: "products/test-image-id",
    }),
    deleteImage: vi.fn().mockResolvedValue({ result: "ok" }),
}));

// Google Generative AI – prevent real API calls
vi.mock("../services/aiService.js", () => ({
    generateSearchKeywords: vi.fn().mockResolvedValue([
        "keyword1", "keyword2", "keyword3",
    ]),
    expandSearchQuery: vi.fn().mockResolvedValue([
        "term1", "term2", "term3",
    ]),
}));

//   Database lifecycle 

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});
