import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserSchema.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { successResponse } from "../utils/apiResponse.js";

const JWT_EXPIRES_IN = "7d";

/**
 * POST /api/auth/register
 * Create a new user account and return a JWT.
 */
export const RegisterUser = asyncHandler(async (req, res) => {
  const { name, password, role, email } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ name }, { email }] });
  if (existingUser) {
    throw new AppError("A user with that name or email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    password: hashedPassword,
    role,
    email,
  });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return successResponse(
    res,
    { user: { id: user._id, name, role, email }, token },
    "User registered successfully",
    201
  );
});

/**
 * POST /api/auth/login
 * Authenticate a user and return a JWT.
 */
export const LoginUser = asyncHandler(async (req, res) => {
  const { name, password } = req.body;

  const user = await User.findOne({ name });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return successResponse(res, {
    user: { id: user._id, name: user.name, role: user.role },
    token,
  });
});
