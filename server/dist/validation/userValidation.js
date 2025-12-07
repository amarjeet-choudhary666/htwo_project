"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const RoleEnum = zod_1.z.enum(['ADMIN', 'USER']);
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    firstname: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    companyName: zod_1.z.string().optional(),
    gstNumber: zod_1.z.string().optional(),
    role: RoleEnum.default('USER')
});
exports.updateUserSchema = zod_1.z.object({
    firstname: zod_1.z.string().optional(),
    companyName: zod_1.z.string().optional(),
    gstNumber: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    role: RoleEnum.optional()
});
