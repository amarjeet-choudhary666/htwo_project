"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartnerUserById = exports.getPartnerUsers = void 0;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getPartnerUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new apiError_1.ApiError(401, 'Unauthorized');
    }
    if (user.role !== 'PARTNER') {
        throw new apiError_1.ApiError(403, 'Access denied. Partner privileges required.');
    }
    const users = await prisma_1.prisma.user.findMany({
        where: {
            partnerId: user.id
        },
        select: {
            id: true,
            email: true,
            firstname: true,
            role: true,
            address: true,
            companyName: true,
            gstNumber: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    purchases: true,
                    userServices: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, users, 'Users retrieved successfully'));
});
exports.getPartnerUserById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    if (!user) {
        throw new apiError_1.ApiError(401, 'Unauthorized');
    }
    if (user.role !== 'PARTNER') {
        throw new apiError_1.ApiError(403, 'Access denied. Partner privileges required.');
    }
    const clientUser = await prisma_1.prisma.user.findFirst({
        where: {
            id: parseInt(id),
            partnerId: user.id
        },
        include: {
            purchases: {
                orderBy: { createdAt: 'desc' },
                take: 10
            },
            userServices: {
                include: {
                    service: true
                },
                take: 10
            }
        }
    });
    if (!clientUser) {
        throw new apiError_1.ApiError(404, 'User not found or access denied');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, clientUser, 'User details retrieved successfully'));
});
