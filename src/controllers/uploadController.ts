import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtrar solo imágenes
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Subir imagen
export async function uploadImage(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se proporcionó ningún archivo' 
      });
    }

    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Imagen subida exitosamente',
      imageUrl: imageUrl,
      filename: req.file.filename
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
}

// Subir múltiples imágenes
export async function uploadMultipleImages(req: Request, res: Response) {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se proporcionaron archivos' 
      });
    }

    const files = req.files as Express.Multer.File[];
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    const imageUrls = files.map(file => `${baseUrl}/uploads/${file.filename}`);
    
    res.status(200).json({
      success: true,
      message: 'Imágenes subidas exitosamente',
      imageUrls: imageUrls,
      count: files.length
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
}
