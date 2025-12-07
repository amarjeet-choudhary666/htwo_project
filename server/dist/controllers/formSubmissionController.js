"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formSubmissionController = void 0;
const prisma_1 = require("../lib/prisma");
const formSubmissionValidation_1 = require("../validation/formSubmissionValidation");
const apiResponse_1 = require("../utils/apiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.formSubmissionController = {
    submitDemoRequest: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const validatedData = formSubmissionValidation_1.createFormSubmissionSchema.parse({
            ...req.body,
            type: 'demo'
        });
        const userId = req.user?.id;
        const submission = await prisma_1.prisma.formSubmission.create({
            data: {
                ...validatedData,
                userId: userId || null
            }
        });
        res.status(201).json(new apiResponse_1.ApiResponse(201, submission, 'Demo request submitted successfully'));
    }),
    submitContactForm: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const validatedData = formSubmissionValidation_1.createFormSubmissionSchema.parse({
            ...req.body,
            type: 'contact'
        });
        const userId = req.user?.id;
        const submission = await prisma_1.prisma.formSubmission.create({
            data: {
                ...validatedData,
                userId: userId || null
            }
        });
        res.status(201).json(new apiResponse_1.ApiResponse(201, submission, 'Contact form submitted successfully'));
    }),
    submitGetInTouchForm: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const validatedData = formSubmissionValidation_1.createFormSubmissionSchema.parse({
            ...req.body,
            type: 'get_in_touch'
        });
        const userId = req.user?.id;
        const submission = await prisma_1.prisma.formSubmission.create({
            data: {
                ...validatedData,
                userId: userId || null
            }
        });
        res.status(201).json(new apiResponse_1.ApiResponse(201, submission, 'Get in touch form submitted successfully'));
    })
};
