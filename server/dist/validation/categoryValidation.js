"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategoryTypeSchema = exports.createCategoryTypeSchema = exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required'),
    description: zod_1.z.string().optional()
});
exports.updateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required').optional(),
    description: zod_1.z.string().nullable().optional()
});
exports.createCategoryTypeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category type name is required'),
    categoryId: zod_1.z.number().int().positive('Category ID is required')
});
exports.updateCategoryTypeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category type name is required').optional(),
    categoryId: zod_1.z.number().int().positive('Category ID is required').optional()
});
