import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { ApiResponse } from '../../utils/apiResponse';
import { ApiError } from '../../utils/apiError';
import { asyncHandler } from '../../utils/asyncHandler';

// Get all service requests
export const getAllServiceRequests = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;

  const where = status ? { status: status as any } : {};

  const requests = await prisma.serviceRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json(
    new ApiResponse(200, requests, 'Service requests retrieved successfully')
  );
});

// Approve service request
export const approveServiceRequest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = (req as any).user?.id;
  const { amount, adminNotes } = req.body;

  if (!amount) {
    throw new ApiError(400, 'Amount is required');
  }

  const request = await prisma.serviceRequest.findUnique({
    where: { id: parseInt(id) }
  });

  if (!request) {
    throw new ApiError(404, 'Service request not found');
  }

  if (request.status !== 'PENDING') {
    throw new ApiError(400, 'Service request has already been processed');
  }

  // Calculate expiration date based on billing cycle
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

  // Create a user if doesn't exist
  let user = await prisma.user.findUnique({
    where: { email: request.email }
  });

  if (!user) {
    // Create a temporary user for the service request
    user = await prisma.user.create({
      data: {
        email: request.email,
        password: '', // No password for partner-created users
        firstname: request.fullName,
        companyName: request.companyName,
        gstNumber: request.gstNumber,
        address: request.address,
        role: 'USER'
      }
    });
  }

  // Create purchase/invoice
  const purchase = await prisma.purchase.create({
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

  // Update service request
  const updatedRequest = await prisma.serviceRequest.update({
    where: { id: parseInt(id) },
    data: {
      status: 'APPROVED',
      adminNotes,
      approvedBy: adminId,
      approvedAt: new Date()
    }
  });

  res.status(200).json(
    new ApiResponse(200, { request: updatedRequest, purchase }, 'Service request approved')
  );
});

// Reject service request
export const rejectServiceRequest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { adminNotes } = req.body;

  const request = await prisma.serviceRequest.findUnique({
    where: { id: parseInt(id) }
  });

  if (!request) {
    throw new ApiError(404, 'Service request not found');
  }

  if (request.status !== 'PENDING') {
    throw new ApiError(400, 'Service request has already been processed');
  }

  const updatedRequest = await prisma.serviceRequest.update({
    where: { id: parseInt(id) },
    data: {
      status: 'REJECTED',
      adminNotes
    }
  });

  res.status(200).json(
    new ApiResponse(200, updatedRequest, 'Service request rejected')
  );
});

