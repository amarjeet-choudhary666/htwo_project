import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/profileController';
import { authenticateUser } from '../middlewares/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Get current user profile
router.get('/profile', getProfile);

// Update profile
router.put('/profile', updateProfile);

// Change password
router.post('/change-password', changePassword);

export default router;
