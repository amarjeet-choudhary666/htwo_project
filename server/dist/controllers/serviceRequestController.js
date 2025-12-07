"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceRequest = exports.getMyServiceRequests = exports.createServiceRequest = void 0;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.createServiceRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { fullName, email, phone, companyName, gstNumber, address, serviceType, servicePlan, serverLocation, billingCycle, additionalNotes } = req.body;
    if (!fullName || !email || !phone || !servicePlan) {
        throw new apiError_1.ApiError(400, 'Full name, email, phone, and service plan are required');
    }
    const serviceRequest = await prisma_1.prisma.serviceRequest.create({
        data: {
            fullName,
            email,
            phone,
            companyName,
            gstNumber,
            address,
            serviceType: serviceType || 'CLOUD',
            servicePlan,
            serverLocation: serverLocation || 'India',
            billingCycle: billingCycle || 'MONTHLY',
            additionalNotes,
        }
    });
    res.status(201).json(new apiResponse_1.ApiResponse(201, serviceRequest, 'Service request submitted successfully'));
});
exports.getMyServiceRequests = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.query;
    if (!email) {
        throw new apiError_1.ApiError(400, 'Email is required');
    }
    const requests = await prisma_1.prisma.serviceRequest.findMany({
        where: { email: email },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, requests, 'Service requests retrieved successfully'));
});
exports.getServiceRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const request = await prisma_1.prisma.serviceRequest.findUnique({
        where: { id: parseInt(id) }
    });
    if (!request) {
        throw new apiError_1.ApiError(404, 'Service request not found');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, request, 'Service request retrieved successfully'));
});
