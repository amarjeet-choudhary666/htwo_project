import { z } from 'zod';

// Enums from Prisma schema
const ServerTypeEnum = z.enum(['DEDICATED', 'VPS']);
const ChipsetEnum = z.enum(['AMD', 'INTEL']);

// Server schemas
export const createServerSchema = z.object({
  serverType: ServerTypeEnum,
  chipset: ChipsetEnum.optional(),
  processorModel: z.string().min(1, 'Processor model is required'),
  physicalCores: z.number().int().positive().optional(),
  logicalVCores: z.number().int().positive(),
  clockSpeed: z.string().min(1, 'Clock speed is required'),
  ramGB: z.number().int().positive().optional(),
  primaryStorage: z.string().optional(),
  secondaryDrive: z.string().optional(),
  raidCard: z.string().optional(),
  bandwidth: z.string().optional(),
  perGBRam: z.number().positive().optional(),
  storageType: z.string().optional(),
  pricePerMonth: z.number().positive(),
  categoryId: z.number().int().positive().optional(),
  categoryTypeId: z.number().int().positive().optional()
}).refine((data) => {
  // For dedicated servers, chipset is required
  if (data.serverType === 'DEDICATED' && !data.chipset) {
    return false;
  }
  return true;
}, {
  message: 'Chipset is required for dedicated servers',
  path: ['chipset']
});

export const updateServerSchema = z.object({
  serverType: ServerTypeEnum.optional(),
  chipset: ChipsetEnum.optional(),
  processorModel: z.string().min(1, 'Processor model is required').optional(),
  physicalCores: z.number().int().positive().nullable().optional(),
  logicalVCores: z.number().int().positive().optional(),
  clockSpeed: z.string().min(1, 'Clock speed is required').optional(),
  ramGB: z.number().int().positive().nullable().optional(),
  primaryStorage: z.string().nullable().optional(),
  secondaryDrive: z.string().nullable().optional(),
  raidCard: z.string().nullable().optional(),
  bandwidth: z.string().nullable().optional(),
  perGBRam: z.number().positive().nullable().optional(),
  storageType: z.string().nullable().optional(),
  pricePerMonth: z.number().positive().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  categoryTypeId: z.number().int().positive().nullable().optional()
});

// Type exports
export type CreateServerInput = z.infer<typeof createServerSchema>;
export type UpdateServerInput = z.infer<typeof updateServerSchema>;