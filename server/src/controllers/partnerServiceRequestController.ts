;import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

// Create service request for partner
export const createServiceRequest = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { fullName, email, phone, companyName, gstNumber, address, serviceType, servicePlan, serverLocation, billingCycle, additionalNotes } = req.body;

  console.log('=== Service Request Data ===');
  console.log('User:', user);
  console.log('Request body:', req.body);

  if (!user) {
    throw new ApiError(401, 'Unauthorized');
  }

  // Validate required fields
  if (!fullName || !email || !phone) {
    throw new ApiError(400, 'Full name, email, and phone are required');
  }

  if (!servicePlan) {
    throw new ApiError(400, 'Service plan is required');
  }

  try {
    const serviceRequest = await prisma.serviceRequest.create({
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
    res.status(201).json(new ApiResponse(201, serviceRequest, 'Service request submitted successfully'));
  } catch (error: any) {
    console.error('❌ Error creating service request:', error);
    throw new ApiError(500, `Failed to create service request: ${error.message}`);
  }
});

// Get partner's service requests
export const getPartnerServiceRequests = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const requests = await prisma.serviceRequest.findMany({
    where: { email: user.email },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json(new ApiResponse(200, requests, 'Service requests retrieved successfully'));
});

// Get service request by ID
export const getServiceRequestById = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  if (!user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const request = await prisma.serviceRequest.findFirst({
    where: {
      id: parseInt(id),
      email: user.email
    }
  });

  if (!request) {
    throw new ApiError(404, 'Service request not found');
  }

  res.status(200).json(new ApiResponse(200, request, 'Service request retrieved successfully'));
});