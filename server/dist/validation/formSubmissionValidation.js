"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFormSubmissionSchema = exports.createFormSubmissionSchema = void 0;
const zod_1 = require("zod");
exports.createFormSubmissionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email format'),
    phone: zod_1.z.string().optional(),
    service: zod_1.z.string().optional(),
    message: zod_1.z.string().optional(),
    type: zod_1.z.enum(['demo', 'contact', 'get_in_touch', 'service_request']),
    status: zod_1.z.string().default('pending'),
    userId: zod_1.z.number().int().positive().optional()
});
exports.updateFormSubmissionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').optional(),
    email: zod_1.z.string().email('Invalid email format').optional(),
    phone: zod_1.z.string().nullable().optional(),
    service: zod_1.z.string().nullable().optional(),
    message: zod_1.z.string().nullable().optional(),
    type: zod_1.z.string().optional(),
    status: zod_1.z.string().optional()
});
