"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDedicatedServerById = exports.getDedicatedServers = void 0;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getDedicatedServers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const chip = req.query.chip;
    const where = {};
    if (chip && ['AMD', 'INTEL'].includes(chip)) {
        where.chip = chip;
    }
    const dedicatedServers = await prisma_1.prisma.dedicatedServer.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, dedicatedServers, 'Dedicated servers retrieved successfully'));
});
exports.getDedicatedServerById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const dedicatedServer = await prisma_1.prisma.dedicatedServer.findUnique({
        where: { id }
    });
    if (!dedicatedServer) {
        throw new apiError_1.ApiError(404, 'Dedicated server not found');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, dedicatedServer, 'Dedicated server retrieved successfully'));
});
