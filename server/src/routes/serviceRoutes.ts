import { Router } from 'express';
import {
  getAllServices,
  getServicesByCategory,
  getServicesByPriority,
  getServicesByCategoryAndPriority,
  getServiceByCategoryAndType,
  getServiceByName,

} from '../controllers/serviceController';
import { getVpsServers, getVpsServerById } from '../controllers/vpsServerController';
import { getDedicatedServers, getDedicatedServerById } from '../controllers/dedicatedServerController';

const router = Router();

// Public routes for services
router.get('/services', getAllServices);
router.get('/services/name/:name', getServiceByName);
router.get('/services/category/:category', getServicesByCategory);
router.get('/services/category/:category/type/:type', getServiceByCategoryAndType);
router.get('/services/priority/:priority', getServicesByPriority);
router.get('/services/category/:category/priority/:priority', getServicesByCategoryAndPriority);

// VPS Servers
router.get('/vps-servers', getVpsServers);
router.get('/vps-servers/:id', getVpsServerById);

// Dedicated Servers
router.get('/dedicated-servers', getDedicatedServers);
router.get('/dedicated-servers/:id', getDedicatedServerById);

export default router;