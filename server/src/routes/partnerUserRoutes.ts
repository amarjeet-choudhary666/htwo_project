import { Router } from 'express';
import { getPartnerUsers, getPartnerUserById } from '../controllers/partnerUserController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get partner's users (clients)
router.get('/', getPartnerUsers);

// Get specific user details
router.get('/:id', getPartnerUserById);

export default router;

