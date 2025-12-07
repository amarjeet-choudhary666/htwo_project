import { Router } from 'express';
import { createPurchase, getUserPurchases } from '../controllers/purchaseController';
import { authenticateUser } from '../middlewares/authMiddleware';

const router = Router();

// All routes require authentication
router.post('/', authenticateUser, createPurchase);
router.get('/', authenticateUser, getUserPurchases);

export default router;
