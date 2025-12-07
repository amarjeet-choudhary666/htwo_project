"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceSchema = exports.createServiceSchema = void 0;
const zod_1 = require("zod");
const PriorityEnum = zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']);
exports.createServiceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Service name is required'),
    categoryId: zod_1.z.number().int().positive().optional(),
    categoryTypeId: zod_1.z.number().int().positive().optional(),
    description: zod_1.z.string().optional(),
    monthlyPrice: zod_1.z.number().positive().optional(),
    yearlyPrice: zod_1.z.number().positive().optional(),
    imageUrl: zod_1.z.string().url().optional(),
    features: zod_1.z.array(zod_1.z.string()).default([]),
    status: zod_1.z.string().default('active'),
    priority: PriorityEnum.default('LOW'),
    ram: zod_1.z.string().default(''),
    storage: zod_1.z.string().default('')
});
exports.updateServiceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Service name is required').optional(),
    categoryId: zod_1.z.number().int().positive().nullable().optional(),
    categoryTypeId: zod_1.z.number().int().positive().nullable().optional(),
    description: zod_1.z.string().nullable().optional(),
    monthlyPrice: zod_1.z.number().positive().nullable().optional(),
    yearlyPrice: zod_1.z.number().positive().nullable().optional(),
    imageUrl: zod_1.z.string().url().nullable().optional(),
    features: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.string().optional(),
    priority: PriorityEnum.optional(),
    ram: zod_1.z.string().optional(),
    storage: zod_1.z.string().optional()
});
