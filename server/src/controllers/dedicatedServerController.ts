import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

export const getDedicatedServers = asyncHandler(async (req: Request, res: Response) => {
  const chip = req.query.chip as string; // 'AMD' or 'INTEL' or undefined for all

  const where: any = {};
  if (chip && ['AMD', 'INTEL'].includes(chip)) {
    where.chip = chip;
  }

  const dedicatedServers = await prisma.dedicatedServer.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json(new ApiResponse(200, dedicatedServers, 'Dedicated servers retrieved successfully'));
});

export const getDedicatedServerById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const dedicatedServer = await prisma.dedicatedServer.findUnique({
    where: { id }
  });

  if (!dedicatedServer) {
    throw new ApiError(404, 'Dedicated server not found');
  }

  res.status(200).json(new ApiResponse(200, dedicatedServer, 'Dedicated server retrieved successfully'));
});