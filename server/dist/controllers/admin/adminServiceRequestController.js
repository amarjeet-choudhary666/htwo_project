"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectServiceRequest = exports.approveServiceRequest = exports.getAllServiceRequests = void 0;
const prisma_1 = require("../../lib/prisma");
const apiResponse_1 = require("../../utils/apiResponse");
const apiError_1 = require("../../utils/apiError");
const asyncHandler_1 = require("../../utils/asyncHandler");
exports.getAllServiceRequests = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status } = req.query;
    const where = status ? { status: status } : {};
    const requests = await prisma_1.prisma.serviceRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, requests, 'Service requests retrieved successfully'));
});
exports.approveServiceRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const adminId = req.user?.id;
    const { amount, adminNotes } = req.body;
    if (!amount) {
        throw new apiError_1.ApiError(400, 'Amount is required');
    }
    const request = await prisma_1.prisma.serviceRequest.findUnique({
        where: { id: parseInt(id) }
    });
    if (!request) {
        throw new apiError_1.ApiError(404, 'Service request not found');
    }
    if (request.status !== 'PENDING') {
        throw new apiError_1.ApiError(400, 'Service request has already been processed');
    }
    const expiresAt = new Date();
    switch (request.billingCycle) {
        case 'YEARLY':
            expiresAt.setDate(expiresAt.getDate() + 365);
            break;
        case 'QUARTERLY':
            expiresAt.setDate(expiresAt.getDate() + 90);
            break;
        case 'MONTHLY':
        default:
            expiresAt.setDate(expiresAt.getDate() + 31);
            break;
    }
    let user = await prisma_1.prisma.user.findUnique({
        where: { email: request.email }
    });
    if (!user) {
        user = await prisma_1.prisma.user.create({
            data: {
                email: request.email,
                password: '',
                firstname: request.fullName,
                companyName: request.companyName,
                gstNumber: request.gstNumber,
                address: request.address,
                role: 'USER'
            }
        });
    }
    const purchase = await prisma_1.prisma.purchase.create({
        data: {
            userId: user.id,
            serviceId: request.servicePlan,
            serviceType: request.serviceType,
            amount: parseFloat(amount),
            paymentMethod: 'partner_request',
            paymentStatus: 'COMPLETED',
            transactionId: `REQ${request.id}-${Date.now()}`,
            expiresAt,
            planType: request.billingCycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY',
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
    const updatedRequest = await prisma_1.prisma.serviceRequest.update({
        where: { id: parseInt(id) },
        data: {
            status: 'APPROVED',
            adminNotes,
            approvedBy: adminId,
            approvedAt: new Date()
        }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, { request: updatedRequest, purchase }, 'Service request approved'));
});
exports.rejectServiceRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const request = await prisma_1.prisma.serviceRequest.findUnique({
        where: { id: parseInt(id) }
    });
    if (!request) {
        throw new apiError_1.ApiError(404, 'Service request not found');
    }
    if (request.status !== 'PENDING') {
        throw new apiError_1.ApiError(400, 'Service request has already been processed');
    }
    const updatedRequest = await prisma_1.prisma.serviceRequest.update({
        where: { id: parseInt(id) },
        data: {
            status: 'REJECTED',
            adminNotes
        }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, updatedRequest, 'Service request rejected'));
});
