import dotenv from "dotenv";
import connectDB from "./config/db.js";
import validateEnv from "./config/validateEnv.js";
import app from "./app.js";

dotenv.config();
validateEnv();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    const shutdown = (signal) => {
        console.log(`\n${signal} received. Shutting down gracefully...`);
        server.close(() => {
            console.log("HTTP server closed.");
            process.exit(0);
        });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Catch unhandled rejections
    process.on("unhandledRejection", (err) => {
        console.error("UNHANDLED REJECTION:", err);
        server.close(() => process.exit(1));
    });
});
