"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWindowsVpsSchema = exports.updateLinuxVpsSchema = exports.createWindowsVpsSchema = exports.createLinuxVpsSchema = void 0;
const zod_1 = require("zod");
const ServerOSEnum = zod_1.z.enum(['LINUX', 'WINDOWS']);
const AvailabilityEnum = zod_1.z.enum(['HIGH_AVAILABILITY', 'NON_HIGH_AVAILABILITY']);
const baseVpsServerSchema = zod_1.z.object({
    availability: AvailabilityEnum,
    processorModel: zod_1.z.string().min(1, 'Processor model is required'),
    perGbRam: zod_1.z.number().int().positive('Per GB RAM must be a positive integer'),
    logicalVCores: zod_1.z.number().int().positive('Logical vCores must be a positive integer'),
    storage: zod_1.z.string().min(1, 'Storage is required'),
    clockSpeed: zod_1.z.number().positive('Clock speed must be a positive number'),
    bandwidth: zod_1.z.number().int().positive('Bandwidth must be a positive integer'),
    pricePerMonth: zod_1.z.number().positive('Price per month must be a positive number'),
});
exports.createLinuxVpsSchema = baseVpsServerSchema.extend({
    os: zod_1.z.literal('LINUX'),
});
exports.createWindowsVpsSchema = baseVpsServerSchema.extend({
    os: zod_1.z.literal('WINDOWS'),
});
exports.updateLinuxVpsSchema = baseVpsServerSchema.partial().extend({
    os: zod_1.z.literal('LINUX').optional(),
});
exports.updateWindowsVpsSchema = baseVpsServerSchema.partial().extend({
    os: zod_1.z.literal('WINDOWS').optional(),
});
