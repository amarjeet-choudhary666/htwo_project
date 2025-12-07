"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPurchases = exports.createPurchase = void 0;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.createPurchase = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { serviceId, serviceType, amount, paymentMethod, billingCycle } = req.body;
    if (!userId) {
        throw new apiError_1.ApiError(401, 'User not authenticated');
    }
    if (!serviceId || !serviceType || !amount) {
        throw new apiError_1.ApiError(400, 'Service ID, service type, and amount are required');
    }
    let dbServiceType;
    if (serviceType === 'VPS' || serviceType === 'DEDICATED') {
        dbServiceType = 'SERVER';
    }
    else if (serviceType === 'CLOUD') {
        dbServiceType = 'CLOUD';
    }
    else {
        dbServiceType = 'CLOUD';
    }
    const expiresAt = new Date();
    console.log('Billing cycle received:', billingCycle);
    if (billingCycle === 'yearly') {
        expiresAt.setDate(expiresAt.getDate() + 365);
        console.log('Setting yearly expiration:', expiresAt);
    }
    else {
        expiresAt.setDate(expiresAt.getDate() + 31);
        console.log('Setting monthly expiration:', expiresAt);
    }
    const purchase = await prisma_1.prisma.purchase.create({
        data: {
            userId,
            serviceId: serviceId.toString(),
            serviceType: dbServiceType,
            amount: parseFloat(amount),
            paymentMethod: paymentMethod || 'dummy',
            paymentStatus: 'COMPLETED',
            transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            expiresAt,
            planType: billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY'
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    firstname: true,
                    companyName: true,
                    address: true,
                    gstNumber: true,
                }
            }
        }
    });
    res.status(201).json(new apiResponse_1.ApiResponse(201, purchase, 'Purchase completed successfully'));
});
exports.getUserPurchases = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new apiError_1.ApiError(401, 'User not authenticated');
    }
    const purchases = await prisma_1.prisma.purchase.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    email: true,
                    firstname: true,
                }
            }
        }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, purchases, 'Purchases retrieved successfully'));
});
