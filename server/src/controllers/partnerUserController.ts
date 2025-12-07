import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

// Get users by partner ID (for partners to see their clients)
export const getPartnerUsers = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user) {
    throw new ApiError(401, 'Unauthorized');
  }

  // Check if user is a partner
  if (user.role !== 'PARTNER') {
    throw new ApiError(403, 'Access denied. Partner privileges required.');
  }

  // Get users where partnerId matches the logged-in partner's ID
  const users = await prisma.user.findMany({
    where: {
      partnerId: user.id
    },
    select: {
      id: true,
      email: true,
      firstname: true,
      role: true,
      address: true,
      companyName: true,
      gstNumber: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          purchases: true,
          userServices: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.status(200).json(new ApiResponse(200, users, 'Users retrieved successfully'));
});

// Get user details by ID (for partners to see their client details)
export const getPartnerUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  if (!user) {
    throw new ApiError(401, 'Unauthorized');
  }

  if (user.role !== 'PARTNER') {
    throw new ApiError(403, 'Access denied. Partner privileges required.');
  }

  // Get user and verify it belongs to this partner
  const clientUser = await prisma.user.findFirst({
    where: {
      id: parseInt(id),
      partnerId: user.id
    },
    include: {
      purchases: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      userServices: {
        include: {
          service: true
        },
        take: 10
      }
    }
  });

  if (!clientUser) {
    throw new ApiError(404, 'User not found or access denied');
  }

  res.status(200).json(new ApiResponse(200, clientUser, 'User details retrieved successfully'));
});

