import { Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Usar memoryStorage para pasar el buffer a Cloudinary
const storage = multer.memoryStorage();

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

// Función helper para subir buffer a Cloudinary
async function uploadToCloudinary(buffer: Buffer, folder: string = 'trabajofacil'): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error: Error | undefined, result: any) => {
        if (error) {
          reject(error);
        } else if (result?.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error('No se pudo obtener la URL de la imagen'));
        }
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
}

// Subir imagen
export async function uploadImage(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se proporcionó ningún archivo' 
      });
    }

    // Verificar si Cloudinary está configurado
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      // Fallback a sistema local si Cloudinary no está configurado
      const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
      
      return res.status(200).json({
        success: true,
        message: 'Imagen subida exitosamente (modo local - configura Cloudinary para producción)',
        imageUrl: imageUrl,
        filename: req.file.filename
      });
    }

    // Subir a Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer);
    
    res.status(200).json({
      success: true,
      message: 'Imagen subida exitosamente',
      imageUrl: imageUrl,
      filename: req.file.originalname
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
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

    // Verificar si Cloudinary está configurado
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      // Fallback a sistema local si Cloudinary no está configurado
      const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
      const imageUrls = files.map(file => `${baseUrl}/uploads/${file.filename}`);
      
      return res.status(200).json({
        success: true,
        message: 'Imágenes subidas exitosamente (modo local - configura Cloudinary para producción)',
        imageUrls: imageUrls,
        count: files.length
      });
    }

    // Subir todas las imágenes a Cloudinary
    const uploadPromises = files.map(file => uploadToCloudinary(file.buffer));
    const imageUrls = await Promise.all(uploadPromises);
    
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
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
