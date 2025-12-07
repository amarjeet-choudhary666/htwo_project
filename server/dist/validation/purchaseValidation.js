"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePurchaseSchema = exports.createPurchaseSchema = void 0;
const zod_1 = require("zod");
const ServiceTypeEnum = zod_1.z.enum(['CLOUD', 'SERVER']);
const PaymentStatusEnum = zod_1.z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']);
exports.createPurchaseSchema = zod_1.z.object({
    serviceType: ServiceTypeEnum,
    serviceId: zod_1.z.string().min(1, 'Service ID is required'),
    amount: zod_1.z.number().positive('Amount must be positive'),
    currency: zod_1.z.string().default('INR'),
    paymentMethod: zod_1.z.string().optional(),
    transactionId: zod_1.z.string().optional()
});
exports.updatePurchaseSchema = zod_1.z.object({
    paymentStatus: PaymentStatusEnum.optional(),
    transactionId: zod_1.z.string().optional(),
    invoicePdf: zod_1.z.string().url().optional()
});
