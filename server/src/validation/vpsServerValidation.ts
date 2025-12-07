import { z } from 'zod';

// Enums from Prisma schema
const ServerOSEnum = z.enum(['LINUX', 'WINDOWS']);
const AvailabilityEnum = z.enum(['HIGH_AVAILABILITY', 'NON_HIGH_AVAILABILITY']);

// Base VPS server schema
const baseVpsServerSchema = z.object({
  availability: AvailabilityEnum,
  processorModel: z.string().min(1, 'Processor model is required'),
  perGbRam: z.number().int().positive('Per GB RAM must be a positive integer'), // in GB
  logicalVCores: z.number().int().positive('Logical vCores must be a positive integer'),
  storage: z.string().min(1, 'Storage is required'),
  clockSpeed: z.number().positive('Clock speed must be a positive number'), // in GHz
  bandwidth: z.number().int().positive('Bandwidth must be a positive integer'), // in Mbps
  pricePerMonth: z.number().positive('Price per month must be a positive number'),
});

// Linux VPS server schema
export const createLinuxVpsSchema = baseVpsServerSchema.extend({
  os: z.literal('LINUX'),
});

// Windows VPS server schema
export const createWindowsVpsSchema = baseVpsServerSchema.extend({
  os: z.literal('WINDOWS'),
});

// Update schemas (fields are optional)
export const updateLinuxVpsSchema = baseVpsServerSchema.partial().extend({
  os: z.literal('LINUX').optional(),
});

export const updateWindowsVpsSchema = baseVpsServerSchema.partial().extend({
  os: z.literal('WINDOWS').optional(),
});

// Type exports
export type CreateLinuxVpsInput = z.infer<typeof createLinuxVpsSchema>;
export type CreateWindowsVpsInput = z.infer<typeof createWindowsVpsSchema>;
export type UpdateLinuxVpsInput = z.infer<typeof updateLinuxVpsSchema>;
export type UpdateWindowsVpsInput = z.infer<typeof updateWindowsVpsSchema>;