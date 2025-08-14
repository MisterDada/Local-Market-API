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
    tags: [{ type: String }],
    searchKeywords: [{ type: String }],
    sematicVector: [{ type: String }],
});

ProductSchema.index({
    name: 'text',
    description: 'text',
    category: 'text',
    tags: 'text',
    searchKeywords: 'text'
}); //just a basic text index to handle text search

export default mongoose.model("Product", ProductSchema);


//BASICALLY JUST AMEND THIS TO STORE THE FILE LOCATION OF THE IMAGE