import { createProduct, deleteProduct, updateProduct } from "../controllers/productController.js";
import VerifyToken from "../middleware/AuthMiddleware.js";
import onlyAllow from '../middleware/RoleMiddleware.js'
import express from "express";
import ProductsSchema from "../models/ProductsSchema.js";

const router = express.Router();

router.get("/allProducts", async (req, res) => {
    try {
        const products = await ProductsSchema.find()

        res.status(200).json({
            data: products
        })
    } catch (error) {
        res.status(400).json({message: "Error Fetching Products, check internet connection"})
    }
})

router.post("/createProduct", VerifyToken, onlyAllow("Seller"), createProduct);

router.delete("/deleteProduct/:id", VerifyToken, onlyAllow("Seller"), deleteProduct)

router.patch("/updateProduct/:id", VerifyToken, onlyAllow("Seller"), updateProduct)


export default router