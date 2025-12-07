"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dedicatedServerFormSchema = void 0;
const zod_1 = require("zod");
const ChipsetEnum = zod_1.z.enum(['AMD', 'INTEL']);
const amdDedicatedServerSchema = zod_1.z.object({
    chip: zod_1.z.literal('AMD'),
    processorModel: zod_1.z.string().min(1, 'Processor model is required'),
    physicalCores: zod_1.z.number().int().positive('Physical cores must be a positive integer'),
    logicalVCores: zod_1.z.number().int().positive('Logical vCores must be a positive integer'),
    clockSpeed: zod_1.z.string().min(1, 'Clock speed is required'),
    ramGb: zod_1.z.number().int().positive('RAM GB must be a positive integer'),
    primaryDrive: zod_1.z.string().min(1, 'Primary drive is required'),
    secondaryDrive: zod_1.z.string().optional(),
    raidCard: zod_1.z.string().optional(),
    pricePerMonth: zod_1.z.number().positive('Price per month must be positive')
});
const intelDedicatedServerSchema = zod_1.z.object({
    chip: zod_1.z.literal('INTEL'),
    processorModel: zod_1.z.string().min(1, 'Processor model is required'),
    physicalCores: zod_1.z.number().int().positive('Physical cores must be a positive integer'),
    logicalVCores: zod_1.z.number().int().positive('Logical vCores must be a positive integer'),
    clockSpeed: zod_1.z.string().min(1, 'Clock speed is required'),
    ramGb: zod_1.z.number().int().positive('RAM GB must be a positive integer'),
    primaryDrive: zod_1.z.string().min(1, 'Primary drive is required'),
    secondaryDrive: zod_1.z.string().optional(),
    raidCard: zod_1.z.string().optional(),
    pricePerMonth: zod_1.z.number().positive('Price per month must be positive')
});
exports.dedicatedServerFormSchema = zod_1.z.union([amdDedicatedServerSchema, intelDedicatedServerSchema]);
