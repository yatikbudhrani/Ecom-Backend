
import cloudinary from 'cloudinary';
import dotenv from 'dotenv/config';
import streamifier from 'streamifier';


// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.v2.uploader.upload_stream(
            { folder: "Profiles" },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );

        streamifier.createReadStream(buffer).pipe(cld_upload_stream);
    });
};

export default uploadToCloudinary;