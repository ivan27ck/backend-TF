import { Router } from 'express';
import { getProfile, updateProfile, getUserById, updateAvatar } from '../controllers/userController';

const router = Router();

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/avatar', updateAvatar);
router.get('/:id', getUserById);

export default router;
