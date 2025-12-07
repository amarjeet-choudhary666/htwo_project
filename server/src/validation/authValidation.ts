import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstname: z.string().optional(),
  address: z.string().optional(),
  companyName: z.string().optional(),
  gstNumber: z.string().optional()
});


export const registeradminSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerPartnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  userType: z.enum(['user', 'partner']).optional().default('user'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  userType: z.enum(['user', 'partner']).optional().default('user'),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type RegisterPartnerInput = z.infer<typeof registerPartnerSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type RegisteradminSchema = z.infer<typeof registerUserSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
