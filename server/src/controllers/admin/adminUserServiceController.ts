import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { ApiResponse } from '../../utils/apiResponse';
import { ApiError } from '../../utils/apiError';
import { asyncHandler } from '../../utils/asyncHandler';

// Get all user services
export const getUserServices = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string || '';

  const where: any = {};

  if (search) {
    where.OR = [
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { firstname: { contains: search, mode: 'insensitive' } } },
      { service: { name: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const [userServices, total] = await Promise.all([
    prisma.userService.findMany({
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
        },
        service: {
          select: {
            id: true,
            name: true,
            monthlyPrice: true,
            yearlyPrice: true,
            category: {
              select: {
                id: true,
                name: true
              }
            },
            categoryType: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    }),
    prisma.userService.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json(
    new ApiResponse(200, {
      userServices,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      total
    }, 'User services retrieved successfully')
  );
});

// Get user service by ID
export const getUserServiceById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const userService = await prisma.userService.findUnique({
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
      },
      service: {
        select: {
          id: true,
          name: true,
          monthlyPrice: true,
          yearlyPrice: true,
          description: true,
          ram: true,
          storage: true,
          category: {
            select: {
              id: true,
              name: true
            }
          },
          categoryType: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  if (!userService) {
    throw new ApiError(404, 'User service not found');
  }

  res.status(200).json(
    new ApiResponse(200, userService, 'User service retrieved successfully')
  );
});

// Create a new user service
export const createUserService = asyncHandler(async (req: Request, res: Response) => {
  const { userId, serviceId, price, priority = 'MEDIUM', domain, partner, paymentMode, acronisFolderLocation } = req.body;

  // Validate required fields
  if (!userId || !serviceId || !price) {
    throw new ApiError(400, 'Missing required fields: userId, serviceId, price');
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Verify service exists
  const service = await prisma.service.findUnique({
    where: { id: parseInt(serviceId) }
  });

  if (!service) {
    throw new ApiError(404, 'Service not found');
  }

  // Check if user already has this service
  const existingUserService = await prisma.userService.findFirst({
    where: {
      userId: parseInt(userId),
      serviceId: parseInt(serviceId)
    }
  });

  if (existingUserService) {
    throw new ApiError(409, 'User already has this service assigned');
  }

  // Create user service
  const userService = await prisma.userService.create({
    data: {
      userId: parseInt(userId),
      serviceId: parseInt(serviceId),
      price: parseFloat(price),
      priority: priority as 'HIGH' | 'MEDIUM' | 'LOW',
      status: 'active'
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstname: true,
          companyName: true
        }
      },
      service: {
        select: {
          id: true,
          name: true,
          monthlyPrice: true,
          yearlyPrice: true,
          category: {
            select: {
              id: true,
              name: true
            }
          },
          categoryType: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  // If additional purchase fields are provided, create a purchase record as well
  let purchase = null;
  if (domain || partner || paymentMode || acronisFolderLocation) {
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    // Determine plan type based on price matching yearly price
    const planType = service.yearlyPrice && parseFloat(price) === service.yearlyPrice ? 'YEARLY' : 'MONTHLY';
    if (planType === 'YEARLY') {
      expiresAt.setDate(expiresAt.getDate() + 365);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 31);
    }

    purchase = await prisma.purchase.create({
      data: {
        userId: parseInt(userId),
        serviceType: 'CLOUD', // Default to cloud service
        serviceId: serviceId.toString(),
        amount: parseFloat(price),
        currency: 'INR',
        paymentMethod: paymentMode || 'card',
        paymentStatus: 'COMPLETED',
        transactionId,
        expiresAt,
        planType,
        domain: domain || null,
        partner: partner || 'htwo',
        acronisFolderLocation: acronisFolderLocation || null
      }
    });
  }

  res.status(201).json(
    new ApiResponse(201, {
      userService,
      purchase
    }, 'User service created successfully')
  );
});

// Update user service
export const updateUserService = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { price, priority, status } = req.body;

  const userService = await prisma.userService.update({
    where: { id: parseInt(id) },
    data: {
      ...(price && { price: parseFloat(price) }),
      ...(priority && { priority }),
      ...(status && { status })
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstname: true,
          companyName: true
        }
      },
      service: {
        select: {
          id: true,
          name: true,
          monthlyPrice: true,
          yearlyPrice: true,
          category: {
            select: {
              id: true,
              name: true
            }
          },
          categoryType: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  res.status(200).json(
    new ApiResponse(200, userService, 'User service updated successfully')
  );
});

// Delete user service
export const deleteUserService = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.userService.delete({
    where: { id: parseInt(id) }
  });

  res.status(200).json(
    new ApiResponse(200, null, 'User service deleted successfully')
  );
});