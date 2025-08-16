import { allProducts, createProduct, deleteProduct, updateProduct, getProductById } from "../controllers/productController.js";
import VerifyToken from "../middleware/AuthMiddleware.js";
import onlyAllow from '../middleware/RoleMiddleware.js';
import { uploadSingleImage } from "../middleware/upload.js";
import express from "express";
import { semanticSearch } from "../controllers/productController.js";

const router = express.Router();

//Home page
router.get("/allProducts", allProducts)

//search page
router.get("/search", semanticSearch)

//get product by ID
router.get("/getByID/:id", getProductById);

//product details page
router.get("/:id", allProducts)



//Create Product Page
router.post("/createProduct", VerifyToken, onlyAllow("Seller"), uploadSingleImage, createProduct); //remeber to add the upload middleware

//Delete Product Button
router.delete("/deleteProduct/:id", VerifyToken, onlyAllow("Seller"), deleteProduct)

//Update Product
router.patch("/updateProduct/:id", VerifyToken, onlyAllow("Seller"), uploadSingleImage, updateProduct)


export default router