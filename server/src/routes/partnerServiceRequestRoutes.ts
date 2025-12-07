import { Router } from 'express';
import { createServiceRequest, getPartnerServiceRequests, getServiceRequestById } from '../controllers/partnerServiceRequestController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Create service request
router.post('/', createServiceRequest);

// Get partner's service requests
router.get('/', getPartnerServiceRequests);

// Get service request by ID
router.get('/:id', getServiceRequestById);

export default router;