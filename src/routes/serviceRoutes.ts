import { Router } from 'express';
import { 
  getServices, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService,
  getNearbyServicesKMeans
} from '../controllers/serviceController';

const router = Router();

router.get('/', getServices);
router.get('/nearby', getNearbyServicesKMeans); // Debe ir antes de /:id
router.get('/:id', getServiceById);
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
