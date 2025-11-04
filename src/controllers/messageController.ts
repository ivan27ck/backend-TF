import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { verifyToken } from '../utils/jwt';
import { emailNotifications } from '../services/emailService';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export async function getMessages(req: AuthenticatedRequest, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: decoded.id },
          { receiverId: decoded.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        receiver: {
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

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function getConversationMessages(req: AuthenticatedRequest, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const currentUserId = decoded.id;
    const { otherUserId } = req.params;

    if (!otherUserId) {
      return res.status(400).json({ message: 'ID del otro usuario requerido' });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: currentUserId,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' }, // Ordenar por fecha ascendente para el historial
    });

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const { receiverId, serviceId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Destinatario y contenido son requeridos' });
    }

    // Verificar que el destinatario existe
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return res.status(404).json({ message: 'Destinatario no encontrado' });
    }

    const message = await prisma.message.create({
      data: {
        senderId: decoded.id,
        receiverId,
        serviceId,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true
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

    // 📧 Enviar notificación por email
    try {
      await emailNotifications.newMessage(
        message.receiver.email,
        message.receiver.name,
        message.sender.name,
        message.content,
        message.service?.title || 'Servicio'
      );
      console.log('📧 Notificación de mensaje enviada');
    } catch (error) {
      console.error('❌ Error enviando notificación de mensaje:', error);
      // No fallar la respuesta por error de email
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function markMessageAsRead(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    if (message.receiverId !== decoded.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { readAt: new Date() },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.json({ success: true, message: updatedMessage });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
