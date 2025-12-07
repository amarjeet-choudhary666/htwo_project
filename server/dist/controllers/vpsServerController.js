"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVpsServerById = exports.getVpsServers = void 0;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getVpsServers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const os = req.query.os;
    const availability = req.query.availability;
    const where = {};
    if (os && ['LINUX', 'WINDOWS'].includes(os)) {
        where.os = os;
    }
    if (availability && ['HIGH_AVAILABILITY', 'NON_HIGH_AVAILABILITY'].includes(availability)) {
        where.availability = availability;
    }
    const vpsServers = await prisma_1.prisma.vpsServer.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, vpsServers, 'VPS servers retrieved successfully'));
});
exports.getVpsServerById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const vpsServer = await prisma_1.prisma.vpsServer.findUnique({
        where: { id: parseInt(id) }
    });
    if (!vpsServer) {
        throw new apiError_1.ApiError(404, 'VPS server not found');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, vpsServer, 'VPS server retrieved successfully'));
});
