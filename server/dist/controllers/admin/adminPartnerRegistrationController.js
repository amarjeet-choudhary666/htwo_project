"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePartnerRegistration = exports.updatePartnerRegistrationStatus = exports.getPartnerRegistrationById = exports.getPartnerRegistrationSummary = exports.getAllPartnerRegistrations = void 0;
const prisma_1 = require("../../lib/prisma");
const apiResponse_1 = require("../../utils/apiResponse");
const apiError_1 = require("../../utils/apiError");
const asyncHandler_1 = require("../../utils/asyncHandler");
exports.getAllPartnerRegistrations = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { search, status, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const where = {};
    if (status) {
        where.status = status;
    }
    if (search) {
        where.OR = [
            { companyName: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }
    const [registrations, total] = await Promise.all([
        prisma_1.prisma.partnerRegistrationForm.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNum,
            select: {
                id: true,
                companyName: true,
                companyAddress: true,
                businessType: true,
                otherBusinessType: true,
                fullName: true,
                email: true,
                phone: true,
                countryRegion: true,
                estimatedMonthlySales: true,
                hasTechnicalSupport: true,
                partnershipReason: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        }),
        prisma_1.prisma.partnerRegistrationForm.count({ where }),
    ]);
    res.status(200).json(new apiResponse_1.ApiResponse(200, {
        partners: registrations,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
        },
    }, 'Partner registrations retrieved successfully'));
});
exports.getPartnerRegistrationSummary = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const [total, pending, approved, rejected] = await Promise.all([
        prisma_1.prisma.partnerRegistrationForm.count(),
        prisma_1.prisma.partnerRegistrationForm.count({ where: { status: 'pending' } }),
        prisma_1.prisma.partnerRegistrationForm.count({ where: { status: 'approved' } }),
        prisma_1.prisma.partnerRegistrationForm.count({ where: { status: 'rejected' } }),
    ]);
    res.status(200).json(new apiResponse_1.ApiResponse(200, {
        summary: { total, pending, approved, rejected },
    }, 'Partner registration summary retrieved successfully'));
});
exports.getPartnerRegistrationById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const registration = await prisma_1.prisma.partnerRegistrationForm.findUnique({
        where: { id: parseInt(id) },
        select: {
            id: true,
            companyName: true,
            companyAddress: true,
            businessType: true,
            otherBusinessType: true,
            fullName: true,
            email: true,
            phone: true,
            countryRegion: true,
            estimatedMonthlySales: true,
            hasTechnicalSupport: true,
            partnershipReason: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!registration) {
        throw new apiError_1.ApiError(404, 'Partner registration not found');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, registration, 'Partner registration retrieved successfully'));
});
exports.updatePartnerRegistrationStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        throw new apiError_1.ApiError(400, 'Invalid status');
    }
    const registration = await prisma_1.prisma.partnerRegistrationForm.findUnique({
        where: { id: parseInt(id) },
    });
    if (!registration) {
        throw new apiError_1.ApiError(404, 'Partner registration not found');
    }
    const updatedRegistration = await prisma_1.prisma.partnerRegistrationForm.update({
        where: { id: parseInt(id) },
        data: { status },
        select: {
            id: true,
            companyName: true,
            companyAddress: true,
            businessType: true,
            otherBusinessType: true,
            fullName: true,
            email: true,
            phone: true,
            countryRegion: true,
            estimatedMonthlySales: true,
            hasTechnicalSupport: true,
            partnershipReason: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, updatedRegistration, 'Partner registration status updated successfully'));
});
exports.deletePartnerRegistration = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const registration = await prisma_1.prisma.partnerRegistrationForm.findUnique({
        where: { id: parseInt(id) },
    });
    if (!registration) {
        throw new apiError_1.ApiError(404, 'Partner registration not found');
    }
    await prisma_1.prisma.partnerRegistrationForm.delete({
        where: { id: parseInt(id) },
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, null, 'Partner registration deleted successfully'));
});
