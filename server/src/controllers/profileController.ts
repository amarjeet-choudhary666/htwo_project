import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

// Get current user profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      firstname: true,
      address: true,
      companyName: true,
      gstNumber: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!userData) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, userData, 'Profile retrieved successfully'));
});

// Update user profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { firstname, address, companyName, gstNumber } = req.body;

  if (!user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!existingUser) {
    throw new ApiError(404, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      firstname: firstname || user.firstname,
      address: address !== undefined ? address : user.address,
      companyName: companyName !== undefined ? companyName : user.companyName,
      gstNumber: gstNumber !== undefined ? gstNumber : user.gstNumber,
    },
    select: {
      id: true,
      email: true,
      firstname: true,
      address: true,
      companyName: true,
      gstNumber: true,
      role: true,
      updatedAt: true,
    },
  });

  res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully'));
});

// Change password
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { currentPassword, newPassword } = req.body;

  if (!user) {
    throw new ApiError(401, 'Unauthorized');
  }

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!existingUser) {
    throw new ApiError(404, 'User not found');
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, existingUser.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});
