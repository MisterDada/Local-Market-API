import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

//Convert buffer to readable stream
const bufferToStream = (buffer) => {
    const readable = new Readable();
    readable._read = () => { };
    readable.push(buffer);
    readable.push(null);
    return readable;
};

export const uploadImage = (imageBuffer, folder = "products") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (err, result) => (err ? reject(err) : resolve(result))
        );
        bufferToStream(imageBuffer).pipe(uploadStream);
    });
};

//Delete an image from Cloudinary by its public_id.
export const deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (_) {
        // Best-effort cleanup; log but don't throw
        console.error(`Failed to delete Cloudinary image: ${publicId}`);
    }
};
