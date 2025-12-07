import { z } from 'zod';

export const createPartnerRegistrationSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyAddress: z.string().min(1, 'Company address is required'),
  businessType: z.enum(['RESELLER', 'IT_CONSULTANT', 'HOSTING_PROVIDER', 'OTHER']),
  otherBusinessType: z.string().optional(),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  countryRegion: z.string().min(1, 'Country/Region is required'),
  estimatedMonthlySales: z.enum(['LESS_THAN_10', 'BETWEEN_10_50', 'BETWEEN_51_200', 'MORE_THAN_200']),
  hasTechnicalSupport: z.boolean(),
  partnershipReason: z.string().optional(),
});

export type CreatePartnerRegistrationInput = z.infer<typeof createPartnerRegistrationSchema>;