import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

// Create a service request
export const createServiceRequest = asyncHandler(async (req: Request, res: Response) => {
  const {
    fullName,
    email,
    phone,
    companyName,
    gstNumber,
    address,
    serviceType,
    servicePlan,
    serverLocation,
    billingCycle,
    additionalNotes
  } = req.body; 

  // Validation
  if (!fullName || !email || !phone || !servicePlan) {
    throw new ApiError(400, 'Full name, email, phone, and service plan are required');
  }

  const serviceRequest = await prisma.serviceRequest.create({
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

  res.status(201).json(
    new ApiResponse(201, serviceRequest, 'Service request submitted successfully')
  );
});

// Get all service requests (for partners to view their own)
export const getMyServiceRequests = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.query;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const requests = await prisma.serviceRequest.findMany({
    where: { email: email as string },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json(
    new ApiResponse(200, requests, 'Service requests retrieved successfully')
  );
});

// Get single service request
export const getServiceRequest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const request = await prisma.serviceRequest.findUnique({
    where: { id: parseInt(id) }
  });

  if (!request) {
    throw new ApiError(404, 'Service request not found');
  }

  res.status(200).json(
    new ApiResponse(200, request, 'Service request retrieved successfully')
  );
});
