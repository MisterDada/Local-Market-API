import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true },
    category: { type: String, required: true },
    image: {
        url: { type: String, required: true },
        public_id: { type: String, required: true }
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

export default mongoose.model("Product", ProductSchema);


//BASICALLY JUST AMEND THIS TO STORE THE FILE LOCATION OF THE IMAGE