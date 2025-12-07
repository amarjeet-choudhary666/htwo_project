import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

// Create a purchase (dummy payment)
export const createPurchase = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { serviceId, serviceType, amount, paymentMethod, billingCycle } = req.body;

  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }

  if (!serviceId || !serviceType || !amount) {
    throw new ApiError(400, 'Service ID, service type, and amount are required');
  }

  // Map frontend service types to database enum values
  let dbServiceType: 'CLOUD' | 'SERVER';
  if (serviceType === 'VPS' || serviceType === 'DEDICATED') {
    dbServiceType = 'SERVER';
  } else if (serviceType === 'CLOUD') {
    dbServiceType = 'CLOUD';
  } else {
    dbServiceType = 'CLOUD'; // Default fallback
  }

  // Calculate expiration date based on billing cycle
  const expiresAt = new Date();
  console.log('Billing cycle received:', billingCycle);
  if (billingCycle === 'yearly') {
    expiresAt.setDate(expiresAt.getDate() + 365); // 365 days for yearly
    console.log('Setting yearly expiration:', expiresAt);
  } else {
    expiresAt.setDate(expiresAt.getDate() + 31); // 31 days for monthly
    console.log('Setting monthly expiration:', expiresAt);
  }

  // Create purchase record
  const purchase = await prisma.purchase.create({
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

  res.status(201).json(new ApiResponse(201, purchase, 'Purchase completed successfully'));
});

// Get user purchases
export const getUserPurchases = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }

  const purchases = await prisma.purchase.findMany({
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

  res.status(200).json(new ApiResponse(200, purchases, 'Purchases retrieved successfully'));
});

