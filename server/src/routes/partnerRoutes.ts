import { Router } from 'express';
import { registerPartner, verifyPartnerOTP, checkEmailExists, sendEmailVerificationOTP, verifyEmailAccess, getApprovedPartners } from '../controllers/partnerRegistrationController';

const router = Router();

// Public route - Get approved partners
router.get('/partners', getApprovedPartners);

// Public route - Check if email exists
router.get('/partners/check-email', checkEmailExists);

// Public route - Send OTP for email verification
router.post('/partners/send-otp', sendEmailVerificationOTP);

// Public route - Verify OTP for email access
router.post('/partners/verify-email-access', verifyEmailAccess);

// Public route - Partner registration (no authentication required)
router.post('/partners/register', (req, res, next) => {
  console.log('🔥 Partner registration route hit!');
  next();
}, registerPartner);

// Public route - Verify partner registration OTP (legacy - for completed registrations)
router.post('/partners/verify-otp', verifyPartnerOTP);

export default router;
