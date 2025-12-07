import { Router } from 'express';
import { SigninUser, SignupUser, SigninAdmin, renderAdminLogin, verifyAdmin, logoutAdmin,  forgotPassword, verifyOTP, resetPassword, logout } from '../controllers/authController';

const router = Router();

// User registration route
router.post('/register', SignupUser);

// User login route
router.post('/login', SigninUser);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Logout route
router.post('/logout', logout);

// Admin login routes
router.get('/admin/login', renderAdminLogin);
router.post('/admin/login', SigninAdmin);
router.get('/admin/verify', verifyAdmin);
router.post('/admin/logout', logoutAdmin);

export default router;