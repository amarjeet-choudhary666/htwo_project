"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const partnerRegistrationController_1 = require("../controllers/partnerRegistrationController");
const router = (0, express_1.Router)();
router.get('/partners', partnerRegistrationController_1.getApprovedPartners);
router.get('/partners/check-email', partnerRegistrationController_1.checkEmailExists);
router.post('/partners/send-otp', partnerRegistrationController_1.sendEmailVerificationOTP);
router.post('/partners/verify-email-access', partnerRegistrationController_1.verifyEmailAccess);
router.post('/partners/register', (req, res, next) => {
    console.log('🔥 Partner registration route hit!');
    next();
}, partnerRegistrationController_1.registerPartner);
router.post('/partners/verify-otp', partnerRegistrationController_1.verifyPartnerOTP);
exports.default = router;
