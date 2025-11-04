import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// Obtener todas las categorías
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener categoría por ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nueva categoría
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, icon, color, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la categoría es requerido'
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon,
        color,
        description,
        active: true
      }
    });

    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar categoría
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, icon, color, description, active } = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar si el nuevo nombre ya existe en otra categoría
    if (name && name !== existingCategory.name) {
      const nameExists = await prisma.category.findUnique({
        where: { name }
      });

      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre'
        });
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        icon,
        color,
        description,
        active
      }
    });

    res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar categoría (desactivar)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar si hay servicios usando esta categoría
    const servicesWithCategory = await prisma.service.findMany({
      where: { category: existingCategory.name }
    });

    if (servicesWithCategory.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la categoría porque hay servicios asociados'
      });
    }

    // Desactivar la categoría en lugar de eliminarla
    await prisma.category.update({
      where: { id },
      data: { active: false }
    });

    res.json({
      success: true,
      message: 'Categoría desactivada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
