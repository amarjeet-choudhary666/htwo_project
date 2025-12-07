"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceRequestById = exports.getPartnerServiceRequests = exports.createServiceRequest = void 0;
;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.createServiceRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const { fullName, email, phone, companyName, gstNumber, address, serviceType, servicePlan, serverLocation, billingCycle, additionalNotes } = req.body;
    console.log('=== Service Request Data ===');
    console.log('User:', user);
    console.log('Request body:', req.body);
    if (!user) {
        throw new apiError_1.ApiError(401, 'Unauthorized');
    }
    if (!fullName || !email || !phone) {
        throw new apiError_1.ApiError(400, 'Full name, email, and phone are required');
    }
    if (!servicePlan) {
        throw new apiError_1.ApiError(400, 'Service plan is required');
    }
    try {
        const serviceRequest = await prisma_1.prisma.serviceRequest.create({
            data: {
                fullName: fullName || user.firstname || 'Partner',
                email: email || user.email,
                phone: phone || '',
                companyName: companyName || user.companyName || null,
                gstNumber: gstNumber || user.gstNumber || null,
                address: address || user.address || null,
                serviceType: serviceType || 'CLOUD',
                servicePlan,
                serverLocation: serverLocation || 'India',
                billingCycle: billingCycle || 'MONTHLY',
                additionalNotes: additionalNotes || null,
                status: 'PENDING'
            }
        });
        console.log('✅ Service request created:', serviceRequest);
        res.status(201).json(new apiResponse_1.ApiResponse(201, serviceRequest, 'Service request submitted successfully'));
    }
    catch (error) {
        console.error('❌ Error creating service request:', error);
        throw new apiError_1.ApiError(500, `Failed to create service request: ${error.message}`);
    }
});
exports.getPartnerServiceRequests = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new apiError_1.ApiError(401, 'Unauthorized');
    }
    const requests = await prisma_1.prisma.serviceRequest.findMany({
        where: { email: user.email },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, requests, 'Service requests retrieved successfully'));
});
exports.getServiceRequestById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    if (!user) {
        throw new apiError_1.ApiError(401, 'Unauthorized');
    }
    const request = await prisma_1.prisma.serviceRequest.findFirst({
        where: {
            id: parseInt(id),
            email: user.email
        }
    });
    if (!request) {
        throw new apiError_1.ApiError(404, 'Service request not found');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, request, 'Service request retrieved successfully'));
});
