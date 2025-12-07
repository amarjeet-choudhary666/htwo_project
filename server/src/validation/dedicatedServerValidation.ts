import { z } from 'zod';

// Enums
const ChipsetEnum = z.enum(['AMD', 'INTEL']);

// AMD Dedicated Server Schema
const amdDedicatedServerSchema = z.object({
  chip: z.literal('AMD'),
  processorModel: z.string().min(1, 'Processor model is required'),
  physicalCores: z.number().int().positive('Physical cores must be a positive integer'),
  logicalVCores: z.number().int().positive('Logical vCores must be a positive integer'),
  clockSpeed: z.string().min(1, 'Clock speed is required'),
  ramGb: z.number().int().positive('RAM GB must be a positive integer'),
  primaryDrive: z.string().min(1, 'Primary drive is required'), // e.g., "1x3.84 TB SSD"
  secondaryDrive: z.string().optional(),
  raidCard: z.string().optional(),
  pricePerMonth: z.number().positive('Price per month must be positive')
});

// Intel Dedicated Server Schema
const intelDedicatedServerSchema = z.object({
  chip: z.literal('INTEL'),
  processorModel: z.string().min(1, 'Processor model is required'),
  physicalCores: z.number().int().positive('Physical cores must be a positive integer'),
  logicalVCores: z.number().int().positive('Logical vCores must be a positive integer'),
  clockSpeed: z.string().min(1, 'Clock speed is required'),
  ramGb: z.number().int().positive('RAM GB must be a positive integer'),
  primaryDrive: z.string().min(1, 'Primary drive is required'), // e.g., "PRIMARY DRIVE"
  secondaryDrive: z.string().optional(),
  raidCard: z.string().optional(),
  pricePerMonth: z.number().positive('Price per month must be positive')
});

// Union schema for dedicated server form
export const dedicatedServerFormSchema = z.union([amdDedicatedServerSchema, intelDedicatedServerSchema]);

// Type exports
export type AmdDedicatedServerInput = z.infer<typeof amdDedicatedServerSchema>;
export type IntelDedicatedServerInput = z.infer<typeof intelDedicatedServerSchema>;
export type DedicatedServerFormInput = z.infer<typeof dedicatedServerFormSchema>;