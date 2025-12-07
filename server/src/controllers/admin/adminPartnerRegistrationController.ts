import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { ApiResponse } from '../../utils/apiResponse';
import { ApiError } from '../../utils/apiError';
import { asyncHandler } from '../../utils/asyncHandler';

// Get all partner registrations with filtering
export const getAllPartnerRegistrations = asyncHandler(async (req: Request, res: Response) => {
  const { search, status, page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { companyName: { contains: search as string, mode: 'insensitive' } },
      { fullName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [registrations, total] = await Promise.all([
    prisma.partnerRegistrationForm.findMany({
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
    prisma.partnerRegistrationForm.count({ where }),
  ]);

  res.status(200).json(new ApiResponse(200, {
    partners: registrations,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  }, 'Partner registrations retrieved successfully'));
});

// Get partner registration summary
export const getPartnerRegistrationSummary = asyncHandler(async (_req: Request, res: Response) => {
  const [total, pending, approved, rejected] = await Promise.all([
    prisma.partnerRegistrationForm.count(),
    prisma.partnerRegistrationForm.count({ where: { status: 'pending' } }),
    prisma.partnerRegistrationForm.count({ where: { status: 'approved' } }),
    prisma.partnerRegistrationForm.count({ where: { status: 'rejected' } }),
  ]);

  res.status(200).json(new ApiResponse(200, {
    summary: { total, pending, approved, rejected },
  }, 'Partner registration summary retrieved successfully'));
});

// Get partner registration by ID
export const getPartnerRegistrationById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const registration = await prisma.partnerRegistrationForm.findUnique({
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
    throw new ApiError(404, 'Partner registration not found');
  }

  res.status(200).json(new ApiResponse(200, registration, 'Partner registration retrieved successfully'));
});

// Update partner registration status
export const updatePartnerRegistrationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const registration = await prisma.partnerRegistrationForm.findUnique({
    where: { id: parseInt(id) },
  });

  if (!registration) {
    throw new ApiError(404, 'Partner registration not found');
  }

  const updatedRegistration = await prisma.partnerRegistrationForm.update({
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

  res.status(200).json(new ApiResponse(200, updatedRegistration, 'Partner registration status updated successfully'));
});

// Delete partner registration
export const deletePartnerRegistration = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const registration = await prisma.partnerRegistrationForm.findUnique({
    where: { id: parseInt(id) },
  });

  if (!registration) {
    throw new ApiError(404, 'Partner registration not found');
  }

  await prisma.partnerRegistrationForm.delete({
    where: { id: parseInt(id) },
  });

  res.status(200).json(new ApiResponse(200, null, 'Partner registration deleted successfully'));
});
