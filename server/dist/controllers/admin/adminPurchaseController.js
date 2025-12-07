"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPurchase = exports.getPurchaseStats = exports.getPurchaseById = exports.getAllPurchases = void 0;
const prisma_1 = require("../../lib/prisma");
const apiResponse_1 = require("../../utils/apiResponse");
const apiError_1 = require("../../utils/apiError");
const asyncHandler_1 = require("../../utils/asyncHandler");
const generateInvoice_1 = require("../../utils/generateInvoice");
exports.getAllPurchases = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const where = {};
    if (search) {
        where.OR = [
            { transactionId: { contains: search, mode: 'insensitive' } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
            { user: { firstname: { contains: search, mode: 'insensitive' } } }
        ];
    }
    if (status) {
        where.paymentStatus = status;
    }
    const [purchases, total] = await Promise.all([
        prisma_1.prisma.purchase.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstname: true,
                        companyName: true
                    }
                }
            }
        }),
        prisma_1.prisma.purchase.count({ where })
    ]);
    const totalPages = Math.ceil(total / limit);
    res.status(200).json(new apiResponse_1.ApiResponse(200, {
        purchases,
        pagination: {
            current: page,
            total: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        },
        total
    }, 'Purchases retrieved successfully'));
});
exports.getPurchaseById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const purchase = await prisma_1.prisma.purchase.findUnique({
        where: { id: parseInt(id) },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    firstname: true,
                    companyName: true,
                    address: true,
                    gstNumber: true
                }
            }
        }
    });
    if (!purchase) {
        throw new apiError_1.ApiError(404, 'Purchase not found');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, purchase, 'Purchase retrieved successfully'));
});
exports.getPurchaseStats = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const [totalPurchases, totalRevenue, completedPurchases, pendingPurchases, failedPurchases, expiringSoon] = await Promise.all([
        prisma_1.prisma.purchase.count(),
        prisma_1.prisma.purchase.aggregate({
            where: { paymentStatus: 'COMPLETED' },
            _sum: { amount: true }
        }),
        prisma_1.prisma.purchase.count({ where: { paymentStatus: 'COMPLETED' } }),
        prisma_1.prisma.purchase.count({ where: { paymentStatus: 'PENDING' } }),
        prisma_1.prisma.purchase.count({ where: { paymentStatus: 'FAILED' } }),
        prisma_1.prisma.purchase.count({
            where: {
                expiresAt: {
                    gte: new Date(),
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            }
        })
    ]);
    res.status(200).json(new apiResponse_1.ApiResponse(200, {
        totalPurchases,
        totalRevenue: totalRevenue._sum.amount || 0,
        completedPurchases,
        pendingPurchases,
        failedPurchases,
        expiringSoon
    }, 'Purchase statistics retrieved successfully'));
});
exports.createPurchase = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, serviceType, serviceId, amount, currency = 'INR', paymentMethod, paymentStatus = 'COMPLETED', planType = 'MONTHLY', domain, partner = 'htwo', acronisFolderLocation } = req.body;
    if (!userId || !serviceType || !serviceId || !amount || !paymentMethod) {
        throw new apiError_1.ApiError(400, 'Missing required fields: userId, serviceType, serviceId, amount, paymentMethod');
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: parseInt(userId) }
    });
    if (!user) {
        throw new apiError_1.ApiError(404, 'User not found');
    }
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    if (planType === 'YEARLY') {
        expiresAt.setDate(expiresAt.getDate() + 365);
    }
    else {
        expiresAt.setDate(expiresAt.getDate() + 31);
    }
    const purchase = await prisma_1.prisma.purchase.create({
        data: {
            userId: parseInt(userId),
            serviceType,
            serviceId,
            amount: parseFloat(amount),
            currency,
            paymentMethod,
            paymentStatus,
            transactionId,
            expiresAt,
            planType,
            domain,
            partner,
            acronisFolderLocation
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    firstname: true,
                    companyName: true
                }
            }
        }
    });
    try {
        const invoicePath = await (0, generateInvoice_1.generateInvoice)(purchase);
        if (invoicePath) {
            await prisma_1.prisma.purchase.update({
                where: { id: purchase.id },
                data: { invoicePdf: invoicePath }
            });
            purchase.invoicePdf = invoicePath;
        }
    }
    catch (error) {
        console.error('Error generating invoice:', error);
    }
    res.status(201).json(new apiResponse_1.ApiResponse(201, purchase, 'Purchase created successfully'));
});
