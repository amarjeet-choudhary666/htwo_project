import { Router } from 'express';
import { formSubmissionController } from '../controllers/formSubmissionController';
import { authenticateUser } from '../middlewares/authMiddleware';

const router = Router();

// Public routes (no authentication required)
router.post('/demo', formSubmissionController.submitDemoRequest);
router.post('/contact', formSubmissionController.submitContactForm);
router.post('/get-in-touch', formSubmissionController.submitGetInTouchForm);

// Service requests are handled only by admins - no public submission

export default router;