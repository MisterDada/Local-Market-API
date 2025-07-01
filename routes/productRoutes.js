import { createProduct } from "../controllers/productController.js";
import VerifyToken from "../middleware/AuthMiddleware.js";
import onlyAllow from '../middleware/RoleMiddleware.js'
import express from "express";

const router = express.Router();

router.post("/createProduct", VerifyToken, onlyAllow("Seller"), createProduct);


export default router