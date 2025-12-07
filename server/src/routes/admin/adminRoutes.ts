import { Router } from 'express';
import { adminUserController } from '../../controllers/admin/adminUserController';
import { adminCategoryController } from '../../controllers/admin/adminCategoryController';
import { adminServiceController } from '../../controllers/admin/adminServiceController';
import { adminVpsServerController } from '../../controllers/admin/adminVpsServerController';
import { adminDedicatedServerController } from '../../controllers/admin/adminDedicatedServerController';
import { adminController } from '../../controllers/admin/adminController';
import { authenticateAdmin as authMiddleware } from '../../middlewares/authMiddleware';
import { SignupAdmin, SigninAdmin } from '../../controllers/authController';
import { upload } from '../../middlewares/uploadMiddleware';
import {
  getAllServiceRequests,
  approveServiceRequest,
  rejectServiceRequest
} from '../../controllers/admin/adminServiceRequestController';
import {
  getAllPurchases,
  getPurchaseById,
  getPurchaseStats,
  createPurchase
} from '../../controllers/admin/adminPurchaseController';
import {
  getUserServices,
  getUserServiceById,
  createUserService,
  updateUserService,
  deleteUserService
} from '../../controllers/admin/adminUserServiceController';
import adminPartnerRegistrationRoutes from './adminPartnerRegistrationRoutes';

const router = Router();

// Admin registration route (unprotected)
router.post('/register', SignupAdmin);

// Admin login route (unprotected)
router.post('/login', SigninAdmin);

// Apply authentication middleware to all admin routes
router.use(authMiddleware);



// Submission management routes (kept for potential future use)

// Users Management
router.get('/users', adminUserController.getUsers);
router.get('/export/users', adminUserController.exportUsers); // Export users to CSV
router.post('/users/by-partner-reference', adminUserController.createUserByPartnerReference); // Specific route must come before parameterized routes
router.post('/users', adminUserController.createUser);
router.get('/users/:id', adminUserController.getUserDetails);
router.put('/users/:id', adminUserController.updateUser);
router.delete('/users/:id', adminUserController.deleteUser);



// Categories Management
router.get('/categories', adminCategoryController.getCategories);
router.post('/categories', adminCategoryController.createCategory);
router.put('/categories/:id', adminCategoryController.updateCategory);
router.delete('/categories/:id', adminCategoryController.deleteCategory);

// Category Types Management
router.get('/categories/:categoryId/types', adminCategoryController.getCategoryTypes);
router.post('/categories/:categoryId/types', adminCategoryController.createCategoryType);
router.put('/category-types/:id', adminCategoryController.updateCategoryType);
router.delete('/category-types/:id', adminCategoryController.deleteCategoryType);

// Partners Management
router.get('/partners/all-with-status', adminController.getAllPartnersWithStatus);
router.get('/partners/all', adminController.getAllPartnersSimple);
router.get('/partners', adminController.getPartners);
router.get('/partners/:id', adminController.getPartnerById);

// Stats API
router.get('/api/stats', adminController.getStats);

// Partner Registrations Management
router.use('/partner-registrations', adminPartnerRegistrationRoutes);

// Services Management
router.get('/services', adminServiceController.getServices);
router.get('/services/:id', adminServiceController.getServiceById);
router.post('/services', upload.single('image'), adminServiceController.createService);
router.put('/services/:id', upload.single('image'), adminServiceController.updateService);
router.delete('/services/:id', adminServiceController.deleteService);
router.put('/services/:id/status', adminServiceController.updateServiceStatus);

// Services by category type
router.get('/services/category-type/:id', adminServiceController.getServicesByCategoryType);

// VPS Servers Management
router.get('/vps-servers', adminVpsServerController.getVpsServers);
router.post('/vps-servers', adminVpsServerController.createVpsServer);
router.put('/vps-servers/:id', adminVpsServerController.updateVpsServer);
router.delete('/vps-servers/:id', adminVpsServerController.deleteVpsServer);

// Dedicated Servers Management
router.get('/dedicated-servers', adminDedicatedServerController.getDedicatedServers);
router.post('/dedicated-servers', adminDedicatedServerController.createDedicatedServer);
router.put('/dedicated-servers/:id', adminDedicatedServerController.updateDedicatedServer);
router.delete('/dedicated-servers/:id', adminDedicatedServerController.deleteDedicatedServer);

// Service Requests Management
router.get('/service-requests', getAllServiceRequests);
router.post('/service-requests/:id/approve', approveServiceRequest);
router.post('/service-requests/:id/reject', rejectServiceRequest);

// Purchases Management
router.get('/purchases', getAllPurchases);
router.post('/purchases', createPurchase);
router.get('/purchases/stats', getPurchaseStats);
router.get('/purchases/:id', getPurchaseById);

// User Services Management
router.get('/user-services', getUserServices);
router.post('/user-services', createUserService);
router.get('/user-services/:id', getUserServiceById);
router.put('/user-services/:id', updateUserService);
router.delete('/user-services/:id', deleteUserService);

export default router;