import { RegisterUser, LoginUser } from "../controllers/authController.js";
import { registerSchema, loginSchema } from "../validations/authValidation.js";
import validate from "../middleware/validate.js";
import express from "express";

const router = express.Router();

router.post("/register", validate(registerSchema), RegisterUser);
router.post("/login", validate(loginSchema), LoginUser);

export default router;