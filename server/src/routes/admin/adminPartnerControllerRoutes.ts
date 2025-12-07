import { Router } from 'express';
import { authenticateAdmin } from '../../middlewares/authMiddleware';

const router = Router();

// Apply authentication middleware to all admin partner routes
router.use(authenticateAdmin);


export default router;