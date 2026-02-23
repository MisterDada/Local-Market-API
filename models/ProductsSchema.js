import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        category: { type: String, required: true },
        image: {
            url: { type: String, default: "" },
            public_id: { type: String, default: "" },
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tags: [{ type: String }],
        searchKeywords: [{ type: String }],
        semanticVector: [{ type: Number }],
        imageStatus: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending",
        },
        keywordStatus: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending",
        },
        imageUploadedAt: { type: Date },
        keywordsGeneratedAt: { type: Date },
    },
    { timestamps: true }
);

ProductSchema.index({
    name: "text",
    description: "text",
    category: "text",
    tags: "text",
    searchKeywords: "text",
});

export default mongoose.model("Product", ProductSchema);