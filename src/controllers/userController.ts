import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { verifyToken } from '../utils/jwt';

export async function getProfile(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        profession: true,
        location: true,
        experience: true,
        avatar: true,
        rating: true,
        reviewsCount: true,
        completedJobs: true,
        verified: true,
        createdAt: true,
        services: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const { name, profession, location, experience, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        name: name || undefined,
        profession: profession || undefined,
        location: location || undefined,
        experience: experience || undefined,
        avatar: avatar || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profession: true,
        location: true,
        experience: true,
        avatar: true,
        rating: true,
        reviewsCount: true,
        completedJobs: true,
        verified: true,
      }
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        profession: true,
        location: true,
        experience: true,
        avatar: true,
        rating: true,
        reviewsCount: true,
        completedJobs: true,
        verified: true,
        services: {
          where: { status: 'active' },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            price: true,
            location: true,
            images: true,
            verified: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function updateAvatar(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ message: 'URL del avatar requerida' });
    }

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        profession: true,
        location: true,
        experience: true,
        avatar: true,
        rating: true,
        reviewsCount: true,
        completedJobs: true,
        verified: true,
        createdAt: true
      }
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}