//call at startup
const requiredVars = [
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "GOOGLE_API_KEY",
];

const validateEnv = () => {
    const missing = requiredVars.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error("Missing required environment variables:");
        missing.forEach((key) => console.error(`   - ${key}`));
        console.error("\nPlease add them to your .env file and restart.");
        process.exit(1);
    }
};

export default validateEnv;
