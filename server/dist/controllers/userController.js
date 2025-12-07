"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const userValidation_1 = require("../validation/userValidation");
exports.getAllUsers = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const users = await prisma_1.prisma.user.findMany({
        include: {
            services: true
        },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, users, 'Users retrieved successfully'));
});
exports.getUserById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: {
            services: true
        }
    });
    if (!user) {
        throw new apiError_1.ApiError(404, 'User not found');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, user, 'User retrieved successfully'));
});
exports.updateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const validatedData = userValidation_1.updateUserSchema.parse(req.body);
    const user = await prisma_1.prisma.user.update({
        where: { id: parseInt(id) },
        data: validatedData,
        include: {
            services: true
        }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, user, 'User updated successfully'));
});
exports.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.user.delete({
        where: { id: parseInt(id) }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, null, 'User deleted successfully'));
});
