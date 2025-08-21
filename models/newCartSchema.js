import mongoose from "mongoose";

const newCartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: {
        url: { type: String },
        public_id: { type: String }
    },
    quantity: { type: Number, default: 1, min: 1 }
}, { timestamps: true });

export default mongoose.model("newCart", newCartSchema);