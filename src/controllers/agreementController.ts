import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { verifyToken } from '../utils/jwt';
import { emailNotifications } from '../services/emailService';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

// 🛡️ CREAR ACUERDO DE SERVICIO (Proveedor activa servicio)
export async function createServiceAgreement(req: AuthenticatedRequest, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const providerId = decoded.id;

    const {
      serviceId,
      clientId,
      providerId: bodyProviderId,
      agreedPrice,
      advancePayment,
      advancePercentage,
      description,
      estimatedDuration,
      location
    } = req.body;

    // Validaciones
    if (!clientId || !agreedPrice || !description) {
      return res.status(400).json({ 
        message: 'clientId, agreedPrice y description son requeridos' 
      });
    }

    // Si se proporciona serviceId, verificar que pertenece al proveedor
    if (serviceId) {
      const service = await prisma.service.findFirst({
        where: {
          id: serviceId,
          userId: providerId
        }
      });

      if (!service) {
        return res.status(403).json({ message: 'No tienes permisos para este servicio' });
      }
    }

    // Verificar que el cliente existe
    const client = await prisma.user.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Validar adelanto
    if (advancePercentage && (advancePercentage < 0 || advancePercentage > 50)) {
      return res.status(400).json({ 
        message: 'El adelanto debe ser entre 0% y 50%' 
      });
    }

    // Calcular adelanto si se proporciona porcentaje
    let finalAdvancePayment = advancePayment;
    if (advancePercentage && !advancePayment) {
      finalAdvancePayment = (agreedPrice * advancePercentage) / 100;
    }

    // Crear acuerdo
    const agreement = await prisma.serviceAgreement.create({
      data: {
        serviceId,
        clientId,
        providerId,
        agreedPrice,
        advancePayment: finalAdvancePayment,
        advancePercentage,
        description,
        estimatedDuration,
        location,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true
          }
        }
      }
    });

    // 📧 Enviar notificación de acuerdo creado
    try {
      await emailNotifications.agreementCreated(
        agreement.client.email,
        agreement.client.name,
        agreement.provider.name,
        agreement.service?.title || 'Servicio Directo',
        agreement.agreedPrice,
        agreement.advancePayment || undefined
      );
    } catch (error) {
      // Silently handle email errors
    }

    res.status(201).json({ 
      success: true, 
      agreement,
      message: 'Acuerdo creado. Esperando aceptación del cliente.' 
    });

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// ✅ ACEPTAR ACUERDO (Cliente acepta términos)
export async function acceptAgreement(req: AuthenticatedRequest, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const clientId = decoded.id;
    const { agreementId } = req.params;

    const agreement = await prisma.serviceAgreement.findFirst({
      where: {
        id: agreementId,
        clientId: clientId,
        status: 'pending'
      }
    });

    if (!agreement) {
      return res.status(404).json({ message: 'Acuerdo no encontrado o ya procesado' });
    }

    // Actualizar acuerdo
    const updatedAgreement = await prisma.serviceAgreement.update({
      where: { id: agreementId },
      data: {
        clientAccepted: true,
        status: 'accepted'
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true
          }
        }
      }
    });

    // 📧 Enviar notificación de acuerdo aceptado
    try {
      await emailNotifications.agreementAccepted(
        updatedAgreement.provider.email,
        updatedAgreement.provider.name,
        updatedAgreement.client.name,
        updatedAgreement.service?.title || 'Servicio Directo'
      );
    } catch (error) {
      // Silently handle email errors
    }

    res.json({ 
      success: true, 
      agreement: updatedAgreement,
      message: 'Acuerdo aceptado. Puedes proceder con el pago del adelanto si es requerido.' 
    });

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// 🚀 CONFIRMAR INICIO DEL TRABAJO (Ambos usuarios)
export async function confirmWorkStart(req: AuthenticatedRequest, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const userId = decoded.id;
    const { agreementId } = req.params;

    const agreement = await prisma.serviceAgreement.findFirst({
      where: {
        id: agreementId,
        OR: [
          { clientId: userId },
          { providerId: userId }
        ],
        status: 'accepted'
      }
    });

    if (!agreement) {
      return res.status(404).json({ message: 'Acuerdo no encontrado' });
    }

    // Determinar si es cliente o proveedor
    const isClient = agreement.clientId === userId;
    const isProvider = agreement.providerId === userId;

    let updateData: any = {};

    if (isClient) {
      updateData.clientConfirmedStart = true;
    } else if (isProvider) {
      updateData.providerConfirmedStart = true;
    }

    // Si ambos han confirmado, cambiar estado
    const willBothConfirm = (isClient && agreement.providerConfirmedStart) || 
                           (isProvider && agreement.clientConfirmedStart) ||
                           (agreement.clientConfirmedStart && agreement.providerConfirmedStart);
    
    if (willBothConfirm) {
      updateData.status = 'started';
      updateData.workStartedAt = new Date();
    }

    const updatedAgreement = await prisma.serviceAgreement.update({
      where: { id: agreementId },
      data: updateData,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // Verificar si el estado debe cambiar a 'started' después de la actualización
    if (updatedAgreement.clientConfirmedStart && updatedAgreement.providerConfirmedStart && updatedAgreement.status === 'accepted') {
      // Actualizar el estado a 'started' si ambos ya confirmaron
      await prisma.serviceAgreement.update({
        where: { id: agreementId },
        data: {
          status: 'started',
          workStartedAt: new Date()
        }
      });
    }

    res.json({ 
      success: true, 
      agreement: updatedAgreement,
      message: isClient ? 
        'Has confirmado el inicio del trabajo' : 
        'Has confirmado el inicio del trabajo'
    });

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// ✅ CONFIRMAR FINALIZACIÓN DEL TRABAJO (Ambos usuarios)
export async function confirmWorkComplete(req: AuthenticatedRequest, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const userId = decoded.id;
    const { agreementId } = req.params;

    const agreement = await prisma.serviceAgreement.findFirst({
      where: {
        id: agreementId,
        OR: [
          { clientId: userId },
          { providerId: userId }
        ],
        status: 'started'
      }
    });

    if (!agreement) {
      return res.status(404).json({ message: 'Acuerdo no encontrado' });
    }

    // Determinar si es cliente o proveedor
    const isClient = agreement.clientId === userId;
    const isProvider = agreement.providerId === userId;

    let updateData: any = {};

    if (isClient) {
      updateData.clientConfirmedComplete = true;
    } else if (isProvider) {
      updateData.providerConfirmedComplete = true;
    }

    // Verificar si ambos confirmarán la finalización después de esta actualización
    const willBothConfirm = (isClient && agreement.providerConfirmedComplete) || 
                           (isProvider && agreement.clientConfirmedComplete);
    
    if (willBothConfirm) {
      updateData.status = 'completed';
      updateData.workCompletedAt = new Date();
      updateData.finalPaymentPaid = true;
      updateData.finalPaymentPaidAt = new Date();
    }

    const updatedAgreement = await prisma.serviceAgreement.update({
      where: { id: agreementId },
      data: updateData,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true
          }
        }
      }
    });

    // 📧 Enviar notificación de trabajo completado (solo si ambos confirmaron)
    if (updatedAgreement.status === 'completed') {
      try {
        await emailNotifications.workCompleted(
          updatedAgreement.client.email,
          updatedAgreement.provider.email,
          updatedAgreement.provider.name,
          updatedAgreement.client.name,
          updatedAgreement.service?.title || 'Servicio Directo',
          updatedAgreement.agreedPrice
        );
      } catch (error) {
        // Silently handle email errors
      }
    }

    res.json({ 
      success: true, 
      agreement: updatedAgreement,
      message: 'Trabajo completado exitosamente. El pago ha sido liberado.'
    });

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// 🚨 CREAR DISPUTA (Solo cliente cuando está en progreso)
export async function createDispute(req: AuthenticatedRequest, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const userId = decoded.id;
    const { agreementId } = req.params;
    const { reason, description } = req.body;

    if (!reason || !description) {
      return res.status(400).json({ message: 'Razón y descripción son requeridas' });
    }

    const agreement = await prisma.serviceAgreement.findFirst({
      where: {
        id: agreementId,
        clientId: userId, // Solo el cliente puede crear disputas
        status: 'started' // Solo cuando está en progreso
      }
    });

    if (!agreement) {
      return res.status(404).json({ 
        message: 'Acuerdo no encontrado o no tienes permisos para crear una disputa' 
      });
    }

    // Crear la disputa
    const dispute = await prisma.dispute.create({
      data: {
        agreementId,
        reportedBy: userId,
        reason,
        description
      }
    });

    // Actualizar el estado del acuerdo a disputed
    await prisma.serviceAgreement.update({
      where: { id: agreementId },
      data: { status: 'disputed' }
    });

    res.json({ 
      success: true, 
      dispute,
      message: 'Disputa creada exitosamente. El acuerdo ha sido marcado como en disputa.' 
    });

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// 📋 OBTENER ACUERDOS DEL USUARIO
export async function getUserAgreements(req: AuthenticatedRequest, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const userId = decoded.id;
    const { type } = req.query; // 'client' o 'provider'

    let whereClause: any = {};

    if (type === 'client') {
      whereClause.clientId = userId;
    } else if (type === 'provider') {
      whereClause.providerId = userId;
    } else {
      whereClause.OR = [
        { clientId: userId },
        { providerId: userId }
      ];
    }

    const agreements = await prisma.serviceAgreement.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, agreements });

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// 📊 OBTENER DETALLES DE UN ACUERDO
export async function getAgreementDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const userId = decoded.id;
    const { agreementId } = req.params;

    const agreement = await prisma.serviceAgreement.findFirst({
      where: {
        id: agreementId,
        OR: [
          { clientId: userId },
          { providerId: userId }
        ]
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true,
            description: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true
          }
        },
        disputes: {
          include: {
            reporter: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!agreement) {
      return res.status(404).json({ message: 'Acuerdo no encontrado' });
    }

    res.json({ success: true, agreement });

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// 🚫 CANCELAR ACUERDO (Cualquier estado excepto completed y cancelled)
export async function cancelAgreement(req: AuthenticatedRequest, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const userId = decoded.id;
    const { agreementId } = req.params;

    const agreement = await prisma.serviceAgreement.findFirst({
      where: {
        id: agreementId,
        OR: [
          { clientId: userId },
          { providerId: userId }
        ]
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!agreement) {
      return res.status(404).json({ message: 'Acuerdo no encontrado' });
    }

    // Verificar que no esté completado o ya cancelado
    if (agreement.status === 'completed') {
      return res.status(400).json({ message: 'No se puede cancelar un acuerdo completado' });
    }

    if (agreement.status === 'cancelled') {
      return res.status(400).json({ message: 'El acuerdo ya está cancelado' });
    }

    // Actualizar el acuerdo a cancelado
    const updatedAgreement = await prisma.serviceAgreement.update({
      where: { id: agreementId },
      data: {
        status: 'cancelled'
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true
          }
        }
      }
    });

    // 📧 Enviar notificación de cancelación
    try {
      const cancellerName = agreement.clientId === userId ? agreement.client.name : agreement.provider.name;
      const otherUser = agreement.clientId === userId ? agreement.provider : agreement.client;
      
      await emailNotifications.agreementCancelled(
        otherUser.email,
        otherUser.name,
        cancellerName,
        updatedAgreement.service?.title || 'Servicio Directo'
      );
    } catch (error) {
      // Silently handle email errors
    }

    res.json({ 
      success: true, 
      agreement: updatedAgreement,
      message: 'Acuerdo cancelado exitosamente' 
    });

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
