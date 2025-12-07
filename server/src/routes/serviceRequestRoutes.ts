import { Router } from 'express';
import {
  createServiceRequest,
  getMyServiceRequests,
  getServiceRequest
} from '../controllers/serviceRequestController';

const router = Router();

// Public routes
router.post('/', createServiceRequest);
router.get('/my-requests', getMyServiceRequests);
router.get('/:id', getServiceRequest);

export default router;
