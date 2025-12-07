import { z } from 'zod';

// Enums from Prisma schema
const ServiceTypeEnum = z.enum(['CLOUD', 'SERVER']);
const PaymentStatusEnum = z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']);

// Purchase schemas
export const createPurchaseSchema = z.object({
  serviceType: ServiceTypeEnum,
  serviceId: z.string().min(1, 'Service ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('INR'),
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional()
});

export const updatePurchaseSchema = z.object({
  paymentStatus: PaymentStatusEnum.optional(),
  transactionId: z.string().optional(),
  invoicePdf: z.string().url().optional()
});

// Type exports
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;