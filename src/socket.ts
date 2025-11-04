import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { emailNotifications } from './services/emailService';

const prisma = new PrismaClient();

interface DecodedToken {
  id: string;
}

export const setupSocketIO = (io: Server) => {
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      (socket as any).user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`✅ User connected: ${user.name}`);

    // Únete a una sala privada individual
    socket.join(user.id);

    // Sala compartida entre dos usuarios
    socket.on('joinRoom', (roomId: string) => {
      socket.join(roomId);
    });

    socket.on('sendMessage', async (data: {
      receiverId: string;
      content: string;
      serviceId?: string;
      roomId: string;
      tempId?: string;
    }) => {
      const { receiverId, content, serviceId, roomId, tempId } = data;
      const senderId = user.id;
    
      try {
        const newMessage = await prisma.message.create({
          data: {
            senderId,
            receiverId,
            content,
            serviceId,
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

        // Enviar notificación por email
        try {
          await emailNotifications.newMessage(
            newMessage.receiver.email,
            newMessage.receiver.name,
            newMessage.sender.name,
            newMessage.content,
            newMessage.service?.title || 'Servicio'
          );
        } catch (error) {
          console.error('Error enviando notificación de mensaje:', error);
        }
    
        // Enviar el mensaje a todos en la sala
        const messageWithTempId = { ...newMessage, tempId };
        io.to(roomId).emit('newMessage', messageWithTempId);
    
        console.log(`Mensaje enviado de ${user.name} a ${receiverId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('messageError', 'Failed to send message.');
      }
    });
    

    socket.on('disconnect', () => {
      console.log(`⛔ User disconnected: ${user.email}`);
    });
  });
};
