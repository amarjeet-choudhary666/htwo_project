"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServicesByCategoryAndPriority = exports.getServicesByPriority = exports.getServicesByCategoryType = exports.getServicesByCategory = exports.deleteService = exports.updateService = exports.createService = exports.getServiceByCategoryAndType = exports.getServiceByName = exports.getServiceById = exports.getAllServices = void 0;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const serviceValidation_1 = require("../validation/serviceValidation");
exports.getAllServices = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const services = await prisma_1.prisma.service.findMany({
        include: {
            category: true,
            categoryType: true
        },
        orderBy: { priority: 'asc' }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, services, 'Services retrieved successfully'));
});
exports.getServiceById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const service = await prisma_1.prisma.service.findUnique({
        where: { id: parseInt(id) },
        include: {
            category: true,
            categoryType: true
        }
    });
    if (!service) {
        throw new apiError_1.ApiError(404, 'Service not found');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, service, 'Service retrieved successfully'));
});
exports.getServiceByName = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name } = req.params;
    const service = await prisma_1.prisma.service.findFirst({
        where: {
            name: {
                equals: name,
                mode: 'insensitive'
            }
        },
        include: {
            category: true,
            categoryType: true,
            owner: {
                select: {
                    id: true,
                    email: true,
                    firstname: true
                }
            }
        }
    });
    if (!service) {
        throw new apiError_1.ApiError(404, 'Service not found');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, service, 'Service retrieved successfully'));
});
exports.getServiceByCategoryAndType = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { category, type } = req.params;
    const services = await prisma_1.prisma.service.findMany({
        where: {
            category: {
                name: {
                    equals: category,
                    mode: 'insensitive'
                }
            },
            categoryType: {
                name: {
                    equals: type,
                    mode: 'insensitive'
                }
            },
            status: 'active'
        },
        include: {
            category: true,
            categoryType: true,
            owner: {
                select: {
                    id: true,
                    email: true,
                    firstname: true
                }
            }
        },
        orderBy: { priority: 'asc' }
    });
    if (!services || services.length === 0) {
        throw new apiError_1.ApiError(404, 'No services found for this category and type');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, services, 'Services retrieved successfully'));
});
exports.createService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validatedData = serviceValidation_1.createServiceSchema.parse(req.body);
    const service = await prisma_1.prisma.service.create({
        data: {
            ...validatedData,
            categoryId: validatedData.categoryId || null,
            categoryTypeId: validatedData.categoryTypeId || null,
            monthlyPrice: validatedData.monthlyPrice || null,
            yearlyPrice: validatedData.yearlyPrice || null,
            imageUrl: validatedData.imageUrl || null,
            description: validatedData.description || null,
            ownerId: 1
        }
    });
    res.status(201).json(new apiResponse_1.ApiResponse(201, service, 'Service created successfully'));
});
exports.updateService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const validatedData = serviceValidation_1.updateServiceSchema.parse(req.body);
    const service = await prisma_1.prisma.service.update({
        where: { id: parseInt(id) },
        data: {
            ...validatedData,
            categoryId: validatedData.categoryId !== undefined ? validatedData.categoryId : undefined,
            categoryTypeId: validatedData.categoryTypeId !== undefined ? validatedData.categoryTypeId : undefined,
            monthlyPrice: validatedData.monthlyPrice !== undefined ? validatedData.monthlyPrice : undefined,
            yearlyPrice: validatedData.yearlyPrice !== undefined ? validatedData.yearlyPrice : undefined,
            imageUrl: validatedData.imageUrl !== undefined ? validatedData.imageUrl : undefined,
            description: validatedData.description !== undefined ? validatedData.description : undefined,
            ram: validatedData.ram !== undefined ? validatedData.ram : undefined,
            storage: validatedData.storage !== undefined ? validatedData.storage : undefined
        }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, service, 'Service updated successfully'));
});
exports.deleteService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.service.delete({
        where: { id: parseInt(id) }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, null, 'Service deleted successfully'));
});
exports.getServicesByCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { category } = req.params;
    const services = await prisma_1.prisma.service.findMany({
        where: {
            category: {
                name: {
                    equals: category,
                    mode: 'insensitive'
                }
            },
            status: 'active'
        },
        include: {
            category: true,
            categoryType: true
        },
        orderBy: { priority: 'asc' }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, services, 'Services retrieved successfully'));
});
exports.getServicesByCategoryType = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const services = await prisma_1.prisma.service.findMany({
        where: {
            categoryTypeId: parseInt(id),
            status: 'active'
        },
        include: {
            category: true,
            categoryType: true
        },
        orderBy: { priority: 'asc' }
    });
    res.status(200).json({ success: true, data: services });
});
exports.getServicesByPriority = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { priority } = req.params;
    const priorityEnum = priority.toUpperCase();
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(priorityEnum)) {
        throw new apiError_1.ApiError(400, 'Invalid priority value. Must be LOW, MEDIUM, or HIGH');
    }
    const services = await prisma_1.prisma.service.findMany({
        where: {
            priority: priorityEnum,
            status: 'active'
        },
        include: {
            category: true,
            categoryType: true
        },
        orderBy: { priority: 'asc' }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, services, 'Services retrieved successfully'));
});
exports.getServicesByCategoryAndPriority = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { category, priority } = req.params;
    const priorityEnum = priority.toUpperCase();
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(priorityEnum)) {
        throw new apiError_1.ApiError(400, 'Invalid priority value. Must be LOW, MEDIUM, or HIGH');
    }
    const services = await prisma_1.prisma.service.findMany({
        where: {
            category: {
                name: {
                    equals: category,
                    mode: 'insensitive'
                }
            },
            priority: priorityEnum,
            status: 'active'
        },
        include: {
            category: true,
            categoryType: true
        },
        orderBy: { priority: 'asc' }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, services, 'Services retrieved successfully'));
});
