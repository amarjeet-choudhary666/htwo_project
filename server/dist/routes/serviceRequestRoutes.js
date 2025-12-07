"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceRequestController_1 = require("../controllers/serviceRequestController");
const router = (0, express_1.Router)();
router.post('/', serviceRequestController_1.createServiceRequest);
router.get('/my-requests', serviceRequestController_1.getMyServiceRequests);
router.get('/:id', serviceRequestController_1.getServiceRequest);
exports.default = router;
