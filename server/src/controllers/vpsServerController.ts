import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

export const getVpsServers = asyncHandler(async (req: Request, res: Response) => {
  const os = req.query.os as string; // 'LINUX' or 'WINDOWS' or undefined for all
  const availability = req.query.availability as string; // 'HIGH_AVAILABILITY' or 'NON_HIGH_AVAILABILITY'

  const where: any = {};
  if (os && ['LINUX', 'WINDOWS'].includes(os)) {
    where.os = os;
  }
  if (availability && ['HIGH_AVAILABILITY', 'NON_HIGH_AVAILABILITY'].includes(availability)) {
    where.availability = availability;
  }

  const vpsServers = await prisma.vpsServer.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json(new ApiResponse(200, vpsServers, 'VPS servers retrieved successfully'));
});

export const getVpsServerById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const vpsServer = await prisma.vpsServer.findUnique({
    where: { id: parseInt(id) }
  });

  if (!vpsServer) {
    throw new ApiError(404, 'VPS server not found');
  }

  res.status(200).json(new ApiResponse(200, vpsServer, 'VPS server retrieved successfully'));
});