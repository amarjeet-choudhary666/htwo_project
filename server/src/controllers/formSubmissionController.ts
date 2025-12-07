import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createFormSubmissionSchema } from '../validation/formSubmissionValidation';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

export const formSubmissionController = {

  // Submit demo request
  submitDemoRequest: asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createFormSubmissionSchema.parse({
      ...req.body,
      type: 'demo'
    });

    const userId = (req as any).user?.id;

    const submission = await prisma.formSubmission.create({
      data: {
        ...validatedData,
        userId: userId || null
      }
    });

    res.status(201).json(
      new ApiResponse(201, submission, 'Demo request submitted successfully')
    );
  }),

  // Submit contact form
  submitContactForm: asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createFormSubmissionSchema.parse({
      ...req.body,
      type: 'contact'
    });

    const userId = (req as any).user?.id;

    const submission = await prisma.formSubmission.create({
      data: {
        ...validatedData,
        userId: userId || null
      }
    });

    res.status(201).json(
      new ApiResponse(201, submission, 'Contact form submitted successfully')
    );
  }),

  // Submit get in touch form
  submitGetInTouchForm: asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createFormSubmissionSchema.parse({
      ...req.body,
      type: 'get_in_touch'
    });

    const userId = (req as any).user?.id;

    const submission = await prisma.formSubmission.create({
      data: {
        ...validatedData,
        userId: userId || null
      }
    });

    res.status(201).json(
      new ApiResponse(201, submission, 'Get in touch form submitted successfully')
    );
  })
};