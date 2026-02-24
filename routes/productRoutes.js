import {
    allProducts,
    createProduct,
    deleteProduct,
    updateProduct,
    getProductById,
    semanticSearch,
} from "../controllers/productController.js";
import VerifyToken from "../middleware/AuthMiddleware.js";
import onlyAllow from "../middleware/RoleMiddleware.js";
import validate from "../middleware/validate.js";
import { uploadSingleImage } from "../middleware/upload.js";
import {
    createProductSchema,
    updateProductSchema,
    searchQuerySchema,
    idParamSchema,
} from "../validations/productValidation.js";
import express from "express";

const router = express.Router();

// Public routes 
router.get("/allProducts", allProducts);
router.get("/search", validate(searchQuerySchema, "query"), semanticSearch);
router.get("/getByID/:id", validate(idParamSchema, "params"), getProductById);
router.get("/:id", validate(idParamSchema, "params"), getProductById);

// Seller only rotes
router.post(
    "/createProduct",
    VerifyToken,
    onlyAllow("Seller"),
    uploadSingleImage,
    validate(createProductSchema),
    createProduct
);

router.delete(
    "/deleteProduct/:id",
    VerifyToken,
    onlyAllow("Seller"),
    validate(idParamSchema, "params"),
    deleteProduct
);

router.patch(
    "/updateProduct/:id",
    VerifyToken,
    onlyAllow("Seller"),
    uploadSingleImage,
    validate(updateProductSchema),
    updateProduct
);

export default router;