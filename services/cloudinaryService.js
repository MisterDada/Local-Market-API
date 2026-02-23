import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

/**
 * Convert a Buffer to a readable stream for Cloudinary's upload_stream API.
 */
const bufferToStream = (buffer) => {
    const readable = new Readable();
    readable._read = () => { };
    readable.push(buffer);
    readable.push(null);
    return readable;
};

/**
 * Upload an image buffer to Cloudinary.
 * @param {Buffer} imageBuffer - Raw image bytes
 * @param {string} [folder="products"] - Cloudinary folder
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadImage = (imageBuffer, folder = "products") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (err, result) => (err ? reject(err) : resolve(result))
        );
        bufferToStream(imageBuffer).pipe(uploadStream);
    });
};

/**
 * Delete an image from Cloudinary by its public_id.
 * Fails silently — caller should not crash if remote cleanup fails.
 * @param {string} publicId
 */
export const deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (_) {
        // Best-effort cleanup; log but don't throw
        console.error(`Failed to delete Cloudinary image: ${publicId}`);
    }
};
