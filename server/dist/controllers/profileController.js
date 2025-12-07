"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../lib/prisma");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new apiError_1.ApiError(401, 'Unauthorized');
    }
    const userData = await prisma_1.prisma.user.findUnique({
        where: { id: user.id },
        select: {
            id: true,
            email: true,
            firstname: true,
            address: true,
            companyName: true,
            gstNumber: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!userData) {
        throw new apiError_1.ApiError(404, 'User not found');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, userData, 'Profile retrieved successfully'));
});
exports.updateProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const { firstname, address, companyName, gstNumber } = req.body;
    if (!user) {
        throw new apiError_1.ApiError(401, 'Unauthorized');
    }
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { id: user.id },
    });
    if (!existingUser) {
        throw new apiError_1.ApiError(404, 'User not found');
    }
    const updatedUser = await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            firstname: firstname || user.firstname,
            address: address !== undefined ? address : user.address,
            companyName: companyName !== undefined ? companyName : user.companyName,
            gstNumber: gstNumber !== undefined ? gstNumber : user.gstNumber,
        },
        select: {
            id: true,
            email: true,
            firstname: true,
            address: true,
            companyName: true,
            gstNumber: true,
            role: true,
            updatedAt: true,
        },
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, updatedUser, 'Profile updated successfully'));
});
exports.changePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;
    if (!user) {
        throw new apiError_1.ApiError(401, 'Unauthorized');
    }
    if (!currentPassword || !newPassword) {
        throw new apiError_1.ApiError(400, 'Current password and new password are required');
    }
    if (newPassword.length < 6) {
        throw new apiError_1.ApiError(400, 'New password must be at least 6 characters');
    }
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { id: user.id },
    });
    if (!existingUser) {
        throw new apiError_1.ApiError(404, 'User not found');
    }
    const isPasswordValid = await bcrypt_1.default.compare(currentPassword, existingUser.password);
    if (!isPasswordValid) {
        throw new apiError_1.ApiError(401, 'Current password is incorrect');
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, null, 'Password changed successfully'));
});
