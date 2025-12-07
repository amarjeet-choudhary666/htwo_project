import { z } from 'zod';

// Partner Registration Form Schema (no password - just registration request)
export const createPartnerSchema = z.object({
  // Company Information
  companyName: z.string().min(1, 'Company name is required'),
  companyAddress: z.string().min(1, 'Company address is required'),
  gstNumber: z.string().optional(),
  businessType: z.enum(['RESELLER', 'IT_CONSULTANT', 'HOSTING_PROVIDER', 'OTHER']),
  otherBusinessType: z.string().optional(),

  // Contact Information
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone is required'),
  countryRegion: z.string().min(1, 'Country/Region is required'),

  // Partnership Details
  estimatedMonthlySales: z.enum(['LESS_THAN_10', 'BETWEEN_10_50', 'BETWEEN_51_200', 'MORE_THAN_200']),
  partnershipReason: z.string().optional(),

  // Additional Information
  hasTechnicalSupport: z.boolean()
});

export const updatePartnerStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'])
});

// Type exports
export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerStatusInput = z.infer<typeof updatePartnerStatusSchema>;
