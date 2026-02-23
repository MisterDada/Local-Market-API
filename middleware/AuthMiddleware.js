import jwt from "jsonwebtoken";
import User from "../models/UserSchema.js";

/**
 * Verify the JWT from the Authorization header and attach
 * the authenticated user to req.user.
 */
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authorization required. Please provide a Bearer token.",
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access denied. Token is missing.",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("_id name email role");

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User belonging to this token no longer exists.",
            });
        }

        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};

export default verifyToken;