import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { verifyToken } from '../utils/jwt';

export async function getReviews(req: Request, res: Response) {
  try {
    const { userId } = req.query;

    const where: any = {};
    if (userId) {
      where.reviewedUserId = userId as string;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        reviewedUser: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function createReview(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const { reviewedUserId, serviceId, rating, comment } = req.body;

    if (!reviewedUserId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Usuario a reseñar y calificación válida son requeridos' });
    }

    // Verificar que el usuario a reseñar existe
    const reviewedUser = await prisma.user.findUnique({
      where: { id: reviewedUserId }
    });

    if (!reviewedUser) {
      return res.status(404).json({ message: 'Usuario a reseñar no encontrado' });
    }

    // Verificar que no se está reseñando a sí mismo
    if (decoded.id === reviewedUserId) {
      return res.status(400).json({ message: 'No puedes reseñarte a ti mismo' });
    }

    // Verificar que no se ha reseñado antes al mismo usuario
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: decoded.id,
        reviewedUserId
      }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Ya has reseñado a este usuario' });
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: decoded.id,
        reviewedUserId,
        serviceId,
        rating,
        comment
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        reviewedUser: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      }
    });

    // Actualizar estadísticas del usuario reseñado
    const userReviews = await prisma.review.findMany({
      where: { reviewedUserId }
    });

    const averageRating = userReviews.reduce((acc, rev) => acc + rev.rating, 0) / userReviews.length;

    await prisma.user.update({
      where: { id: reviewedUserId },
      data: {
        rating: averageRating,
        reviewsCount: userReviews.length
      }
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
