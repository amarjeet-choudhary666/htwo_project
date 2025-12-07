import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { ApiResponse } from '../../utils/apiResponse';
import { ApiError } from '../../utils/apiError';
import { asyncHandler } from '../../utils/asyncHandler';

// Get all purchases
export const getAllPurchases = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string || '';
  const status = req.query.status as string || '';

  const where: any = {};

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
    prisma.purchase.findMany({
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
    prisma.purchase.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json(
    new ApiResponse(200, {
      purchases,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      total
    }, 'Purchases retrieved successfully')
  );
});

// Get purchase by ID
export const getPurchaseById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const purchase = await prisma.purchase.findUnique({
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
    throw new ApiError(404, 'Purchase not found');
  }

  res.status(200).json(
    new ApiResponse(200, purchase, 'Purchase retrieved successfully')
  );
});

// Get purchase statistics
export const getPurchaseStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    totalPurchases,
    totalRevenue,
    completedPurchases,
    pendingPurchases,
    failedPurchases,
    expiringSoon
  ] = await Promise.all([
    prisma.purchase.count(),
    prisma.purchase.aggregate({
      where: { paymentStatus: 'COMPLETED' },
      _sum: { amount: true }
    }),
    prisma.purchase.count({ where: { paymentStatus: 'COMPLETED' } }),
    prisma.purchase.count({ where: { paymentStatus: 'PENDING' } }),
    prisma.purchase.count({ where: { paymentStatus: 'FAILED' } }),
    prisma.purchase.count({
      where: {
        expiresAt: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      }
    })
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      totalPurchases,
      totalRevenue: totalRevenue._sum.amount || 0,
      completedPurchases,
      pendingPurchases,
      failedPurchases,
      expiringSoon
    }, 'Purchase statistics retrieved successfully')
  );
});

// Create a new purchase
export const createPurchase = asyncHandler(async (req: Request, res: Response) => {
  const {
    userId,
    serviceType,
    serviceId,
    amount,
    currency = 'INR',
    paymentMethod,
    paymentStatus = 'COMPLETED',
    planType = 'MONTHLY',
    domain,
    partner = 'htwo',
    acronisFolderLocation
  } = req.body;

  // Validate required fields
  if (!userId || !serviceType || !serviceId || !amount || !paymentMethod) {
    throw new ApiError(400, 'Missing required fields: userId, serviceType, serviceId, amount, paymentMethod');
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Generate transaction ID
  const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Calculate expiration date based on plan type
  const expiresAt = new Date();
  if (planType === 'YEARLY') {
    expiresAt.setDate(expiresAt.getDate() + 365);
  } else {
    // MONTHLY or default
    expiresAt.setDate(expiresAt.getDate() + 31);
  }

  // Create purchase
  const purchase = await prisma.purchase.create({
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

  res.status(201).json(
    new ApiResponse(201, purchase, 'Purchase created successfully')
  );
});
