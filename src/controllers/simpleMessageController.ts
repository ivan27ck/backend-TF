import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// Enviar mensaje simple - SIN TOKEN
export async function sendSimpleMessage(req: Request, res: Response) {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos: senderId, receiverId, content' 
      });
    }

    console.log('📤 Enviando mensaje simple:', { senderId, receiverId, content });

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
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
        }
      }
    });

    console.log('✅ Mensaje guardado en BD:', message.id);
    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Obtener mensajes de una conversación - SIN TOKEN
export async function getSimpleMessages(req: Request, res: Response) {
  try {
    const { userId1, userId2 } = req.params;

    if (!userId1 || !userId2) {
      return res.status(400).json({ 
        message: 'Faltan parámetros: userId1, userId2' 
      });
    }

    console.log('📥 Obteniendo mensajes entre:', { userId1, userId2 });

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ]
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
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log('✅ Mensajes obtenidos:', messages.length);
    res.json({ success: true, messages });
  } catch (error) {
    console.error('❌ Error getting messages:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Obtener conversaciones de un usuario (estilo WhatsApp)
export async function getUserConversations(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        message: 'Falta parámetro: userId' 
      });
    }

    console.log('📋 Obteniendo conversaciones para usuario:', userId);

    // Obtener todos los usuarios con los que ha intercambiado mensajes
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Agrupar por usuario y obtener el último mensaje
    const conversationMap = new Map();
    
    conversations.forEach(message => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const otherUser = message.senderId === userId ? message.receiver : message.sender;
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          user: otherUser,
          lastMessage: message,
          unreadCount: 0
        });
      }
    });

    const conversationList = Array.from(conversationMap.values());

    console.log('✅ Conversaciones obtenidas:', conversationList.length);
    res.json({ success: true, conversations: conversationList });
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Buscar usuarios para iniciar nuevas conversaciones
export async function searchUsers(req: Request, res: Response) {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        message: 'Falta parámetro: query' 
      });
    }

    console.log('🔍 Buscando usuarios con query:', query);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
          { id: { equals: query } } // Buscar también por ID exacto
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        profession: true,
        location: true
      },
      take: 10
    });

    console.log('✅ Usuarios encontrados:', users.length);
    res.json({ success: true, users });
  } catch (error) {
    console.error('❌ Error searching users:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
