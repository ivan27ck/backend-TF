import { Router } from 'express';
import { upload, uploadImage, uploadMultipleImages } from '../controllers/uploadController';

const router = Router();

// Subir una sola imagen
router.post('/single', upload.single('image'), uploadImage);

// Subir múltiples imágenes
router.post('/multiple', upload.array('images', 5), uploadMultipleImages);

export default router;
