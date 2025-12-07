import { Router } from 'express';
import { authenticateAdmin } from '../../middlewares/authMiddleware';
import {
  getAllPartnerRegistrations,
  getPartnerRegistrationSummary,
  getPartnerRegistrationById,
  updatePartnerRegistrationStatus,
  deletePartnerRegistration
} from '../../controllers/admin/adminPartnerRegistrationController';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateAdmin);

// Get all partner registrations with filtering
router.get('/', getAllPartnerRegistrations);

// Get partner registration summary
router.get('/summary', getPartnerRegistrationSummary);

// Get partner registration by ID
router.get('/:id', getPartnerRegistrationById);

// Update partner registration status
router.put('/:id/status', updatePartnerRegistrationStatus);

// Delete partner registration
router.delete('/:id', deletePartnerRegistration);

export default router;