"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const formSubmissionController_1 = require("../controllers/formSubmissionController");
const router = (0, express_1.Router)();
router.post('/demo', formSubmissionController_1.formSubmissionController.submitDemoRequest);
router.post('/contact', formSubmissionController_1.formSubmissionController.submitContactForm);
router.post('/get-in-touch', formSubmissionController_1.formSubmissionController.submitGetInTouchForm);
exports.default = router;
