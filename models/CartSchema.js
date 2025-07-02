import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }, 
    items: ["CartItem"]
})


export default mongoose.model("CartSchema", cartSchema)