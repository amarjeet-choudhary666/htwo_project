"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServerSchema = exports.createServerSchema = void 0;
const zod_1 = require("zod");
const ServerTypeEnum = zod_1.z.enum(['DEDICATED', 'VPS']);
const ChipsetEnum = zod_1.z.enum(['AMD', 'INTEL']);
exports.createServerSchema = zod_1.z.object({
    serverType: ServerTypeEnum,
    chipset: ChipsetEnum.optional(),
    processorModel: zod_1.z.string().min(1, 'Processor model is required'),
    physicalCores: zod_1.z.number().int().positive().optional(),
    logicalVCores: zod_1.z.number().int().positive(),
    clockSpeed: zod_1.z.string().min(1, 'Clock speed is required'),
    ramGB: zod_1.z.number().int().positive().optional(),
    primaryStorage: zod_1.z.string().optional(),
    secondaryDrive: zod_1.z.string().optional(),
    raidCard: zod_1.z.string().optional(),
    bandwidth: zod_1.z.string().optional(),
    perGBRam: zod_1.z.number().positive().optional(),
    storageType: zod_1.z.string().optional(),
    pricePerMonth: zod_1.z.number().positive(),
    categoryId: zod_1.z.number().int().positive().optional(),
    categoryTypeId: zod_1.z.number().int().positive().optional()
}).refine((data) => {
    if (data.serverType === 'DEDICATED' && !data.chipset) {
        return false;
    }
    return true;
}, {
    message: 'Chipset is required for dedicated servers',
    path: ['chipset']
});
exports.updateServerSchema = zod_1.z.object({
    serverType: ServerTypeEnum.optional(),
    chipset: ChipsetEnum.optional(),
    processorModel: zod_1.z.string().min(1, 'Processor model is required').optional(),
    physicalCores: zod_1.z.number().int().positive().nullable().optional(),
    logicalVCores: zod_1.z.number().int().positive().optional(),
    clockSpeed: zod_1.z.string().min(1, 'Clock speed is required').optional(),
    ramGB: zod_1.z.number().int().positive().nullable().optional(),
    primaryStorage: zod_1.z.string().nullable().optional(),
    secondaryDrive: zod_1.z.string().nullable().optional(),
    raidCard: zod_1.z.string().nullable().optional(),
    bandwidth: zod_1.z.string().nullable().optional(),
    perGBRam: zod_1.z.number().positive().nullable().optional(),
    storageType: zod_1.z.string().nullable().optional(),
    pricePerMonth: zod_1.z.number().positive().optional(),
    categoryId: zod_1.z.number().int().positive().nullable().optional(),
    categoryTypeId: zod_1.z.number().int().positive().nullable().optional()
});
