"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserService = exports.updateUserService = exports.createUserService = exports.getUserServiceById = exports.getUserServices = void 0;
const prisma_1 = require("../../lib/prisma");
const apiResponse_1 = require("../../utils/apiResponse");
const apiError_1 = require("../../utils/apiError");
const asyncHandler_1 = require("../../utils/asyncHandler");
exports.getUserServices = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const where = {};
    if (search) {
        where.OR = [
            { user: { email: { contains: search, mode: 'insensitive' } } },
            { user: { firstname: { contains: search, mode: 'insensitive' } } },
            { service: { name: { contains: search, mode: 'insensitive' } } }
        ];
    }
    const [userServices, total] = await Promise.all([
        prisma_1.prisma.userService.findMany({
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
        prisma_1.prisma.userService.count({ where })
    ]);
    const totalPages = Math.ceil(total / limit);
    res.status(200).json(new apiResponse_1.ApiResponse(200, {
        userServices,
        pagination: {
            current: page,
            total: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        },
        total
    }, 'User services retrieved successfully'));
});
exports.getUserServiceById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userService = await prisma_1.prisma.userService.findUnique({
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
        throw new apiError_1.ApiError(404, 'User service not found');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, userService, 'User service retrieved successfully'));
});
exports.createUserService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, serviceId, price, priority = 'MEDIUM', domain, partner, paymentMode, acronisFolderLocation } = req.body;
    if (!userId || !serviceId || !price) {
        throw new apiError_1.ApiError(400, 'Missing required fields: userId, serviceId, price');
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: parseInt(userId) }
    });
    if (!user) {
        throw new apiError_1.ApiError(404, 'User not found');
    }
    const service = await prisma_1.prisma.service.findUnique({
        where: { id: parseInt(serviceId) }
    });
    if (!service) {
        throw new apiError_1.ApiError(404, 'Service not found');
    }
    const existingUserService = await prisma_1.prisma.userService.findFirst({
        where: {
            userId: parseInt(userId),
            serviceId: parseInt(serviceId)
        }
    });
    if (existingUserService) {
        throw new apiError_1.ApiError(409, 'User already has this service assigned');
    }
    const userService = await prisma_1.prisma.userService.create({
        data: {
            userId: parseInt(userId),
            serviceId: parseInt(serviceId),
            price: parseFloat(price),
            priority: priority,
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
    let purchase = null;
    if (domain || partner || paymentMode || acronisFolderLocation) {
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expiresAt = new Date();
        const planType = service.yearlyPrice && parseFloat(price) === service.yearlyPrice ? 'YEARLY' : 'MONTHLY';
        if (planType === 'YEARLY') {
            expiresAt.setDate(expiresAt.getDate() + 365);
        }
        else {
            expiresAt.setDate(expiresAt.getDate() + 31);
        }
        purchase = await prisma_1.prisma.purchase.create({
            data: {
                userId: parseInt(userId),
                serviceType: 'CLOUD',
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
    res.status(201).json(new apiResponse_1.ApiResponse(201, {
        userService,
        purchase
    }, 'User service created successfully'));
});
exports.updateUserService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { price, priority, status } = req.body;
    const userService = await prisma_1.prisma.userService.update({
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
    res.status(200).json(new apiResponse_1.ApiResponse(200, userService, 'User service updated successfully'));
});
exports.deleteUserService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.userService.delete({
        where: { id: parseInt(id) }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, null, 'User service deleted successfully'));
});
