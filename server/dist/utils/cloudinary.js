"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ddjmghwji',
    api_key: process.env.CLOUDINARY_API_KEY || '174454949199128',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'mcYwdb3wfMBOc3f8sivCiECq4vg',
});
const uploadToCloudinary = async (filePath, folder = 'partners') => {
    try {
        console.log('Uploading to Cloudinary:', filePath);
        const result = await cloudinary_1.v2.uploader.upload(filePath, {
            folder,
            resource_type: 'auto',
        });
        console.log('Upload successful:', result.secure_url);
        try {
            fs_1.default.unlinkSync(filePath);
        }
        catch (cleanupError) {
            console.warn('Failed to cleanup file:', cleanupError);
        }
        return result.secure_url;
    }
    catch (error) {
        console.error('Cloudinary upload error:', error);
        try {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        catch (cleanupError) {
            console.warn('Failed to cleanup file after error:', cleanupError);
        }
        throw new Error('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary_1.v2.uploader.destroy(publicId);
        console.log('File deleted from Cloudinary:', publicId);
    }
    catch (error) {
        console.error('Failed to delete from Cloudinary:', error);
        throw error;
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
