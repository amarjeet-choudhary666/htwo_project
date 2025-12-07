"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePartnerStatusSchema = exports.createPartnerSchema = void 0;
const zod_1 = require("zod");
exports.createPartnerSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(1, 'Company name is required'),
    companyAddress: zod_1.z.string().min(1, 'Company address is required'),
    businessType: zod_1.z.enum(['RESELLER', 'IT_CONSULTANT', 'HOSTING_PROVIDER', 'OTHER']),
    otherBusinessType: zod_1.z.string().optional(),
    fullName: zod_1.z.string().min(1, 'Full name is required'),
    email: zod_1.z.string().email('Invalid email format'),
    phone: zod_1.z.string().min(1, 'Phone is required'),
    countryRegion: zod_1.z.string().min(1, 'Country/Region is required'),
    estimatedMonthlySales: zod_1.z.enum(['LESS_THAN_10', 'BETWEEN_10_50', 'BETWEEN_51_200', 'MORE_THAN_200']),
    partnershipReason: zod_1.z.string().optional(),
    hasTechnicalSupport: zod_1.z.boolean()
});
exports.updatePartnerStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'approved', 'rejected'])
});
