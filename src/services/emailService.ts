import nodemailer from 'nodemailer';

// Configuración del transporter de email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Plantillas de email
const emailTemplates = {
  // Notificación de nuevo mensaje
  newMessage: (data: {
    recipientName: string;
    senderName: string;
    messageContent: string;
    serviceTitle: string;
    messageUrl: string;
  }) => ({
    subject: `💬 Nuevo mensaje de ${data.senderName} - TrabajoFácil`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #1e293b, #334155); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🛠️ TrabajoFácil</h1>
          <p style="color: #cbd5e1; margin: 5px 0 0 0;">Plataforma de Servicios Profesionales</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0;">💬 Tienes un nuevo mensaje</h2>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #475569;"><strong>De:</strong> ${data.senderName}</p>
            <p style="margin: 0 0 10px 0; color: #475569;"><strong>Servicio:</strong> ${data.serviceTitle}</p>
            <p style="margin: 0; color: #1e293b; font-style: italic;">"${data.messageContent}"</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.messageUrl}" 
               style="background: #1e293b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              📱 Responder Mensaje
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; color: #64748b; font-size: 14px;">
            <p>Este mensaje fue enviado desde TrabajoFácil. Si no esperabas este mensaje, puedes ignorarlo.</p>
          </div>
        </div>
      </div>
    `
  }),

  // Notificación de acuerdo creado
  agreementCreated: (data: {
    clientName: string;
    providerName: string;
    serviceTitle: string;
    agreedPrice: number;
    advancePayment?: number;
    agreementUrl: string;
  }) => ({
    subject: `🛡️ Nuevo acuerdo de servicio - ${data.serviceTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🛡️ TrabajoFácil Seguro</h1>
          <p style="color: #d1fae5; margin: 5px 0 0 0;">Sistema de Acuerdos Garantizados</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0;">🛡️ Nuevo Acuerdo de Servicio</h2>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin: 0 0 15px 0;">📋 Detalles del Acuerdo</h3>
            <p style="margin: 5px 0; color: #374151;"><strong>Servicio:</strong> ${data.serviceTitle}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Proveedor:</strong> ${data.providerName}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Cliente:</strong> ${data.clientName}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Precio Total:</strong> $${data.agreedPrice.toFixed(2)} MXN</p>
            ${data.advancePayment ? `<p style="margin: 5px 0; color: #374151;"><strong>Adelanto:</strong> $${data.advancePayment.toFixed(2)} MXN</p>` : ''}
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-weight: bold;">⚠️ Acción Requerida</p>
            <p style="margin: 5px 0 0 0; color: #92400e;">El cliente debe aceptar los términos para que el acuerdo sea válido.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.agreementUrl}" 
               style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              📋 Ver Acuerdo
            </a>
          </div>
        </div>
      </div>
    `
  }),

  // Notificación de acuerdo aceptado
  agreementAccepted: (data: {
    providerName: string;
    clientName: string;
    serviceTitle: string;
    agreementUrl: string;
  }) => ({
    subject: `✅ Acuerdo aceptado - ${data.serviceTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ Acuerdo Aceptado</h1>
          <p style="color: #d1fae5; margin: 5px 0 0 0;">¡El trabajo puede comenzar!</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0;">🎉 ¡Acuerdo Aceptado!</h2>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #374151;"><strong>Servicio:</strong> ${data.serviceTitle}</p>
            <p style="margin: 0 0 10px 0; color: #374151;"><strong>Cliente:</strong> ${data.clientName}</p>
            <p style="margin: 0; color: #374151;"><strong>Proveedor:</strong> ${data.providerName}</p>
          </div>
          
          <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-weight: bold;">📋 Próximo Paso</p>
            <p style="margin: 5px 0 0 0; color: #1e40af;">Ambos deben confirmar el inicio del trabajo para comenzar.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.agreementUrl}" 
               style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              🚀 Confirmar Inicio
            </a>
          </div>
        </div>
      </div>
    `
  }),

  // Notificación de trabajo completado
  workCompleted: (data: {
    providerName: string;
    clientName: string;
    serviceTitle: string;
    totalAmount: number;
    agreementUrl: string;
  }) => ({
    subject: `🎉 Trabajo completado - ${data.serviceTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 ¡Trabajo Completado!</h1>
          <p style="color: #d1fae5; margin: 5px 0 0 0;">Pago liberado automáticamente</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0;">✅ Servicio Finalizado</h2>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #374151;"><strong>Servicio:</strong> ${data.serviceTitle}</p>
            <p style="margin: 0 0 10px 0; color: #374151;"><strong>Cliente:</strong> ${data.clientName}</p>
            <p style="margin: 0 0 10px 0; color: #374151;"><strong>Proveedor:</strong> ${data.providerName}</p>
            <p style="margin: 0; color: #374151;"><strong>Total Pagado:</strong> $${data.totalAmount.toFixed(2)} MXN</p>
          </div>
          
          <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-weight: bold;">💰 Pago Liberado</p>
            <p style="margin: 5px 0 0 0; color: #1e40af;">El pago ha sido liberado automáticamente al proveedor.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.agreementUrl}" 
               style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              ⭐ Calificar Servicio
            </a>
          </div>
        </div>
      </div>
    `
  }),

  // Notificación de disputa
  disputeCreated: (data: {
    reportedBy: string;
    otherParty: string;
    serviceTitle: string;
    reason: string;
    disputeUrl: string;
  }) => ({
    subject: `⚠️ Disputa reportada - ${data.serviceTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Disputa Reportada</h1>
          <p style="color: #fecaca; margin: 5px 0 0 0;">Se requiere revisión del equipo</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0;">🚨 Disputa en Progreso</h2>
          
          <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #374151;"><strong>Servicio:</strong> ${data.serviceTitle}</p>
            <p style="margin: 0 0 10px 0; color: #374151;"><strong>Reportado por:</strong> ${data.reportedBy}</p>
            <p style="margin: 0 0 10px 0; color: #374151;"><strong>Otra parte:</strong> ${data.otherParty}</p>
            <p style="margin: 0; color: #374151;"><strong>Razón:</strong> ${data.reason}</p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-weight: bold;">🔍 Acción Requerida</p>
            <p style="margin: 5px 0 0 0; color: #92400e;">El equipo de soporte revisará esta disputa en las próximas 24 horas.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.disputeUrl}" 
               style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              🔍 Revisar Disputa
            </a>
          </div>
        </div>
      </div>
    `
  }),

  // Notificación de acuerdo cancelado
  agreementCancelled: (data: {
    recipientName: string;
    cancellerName: string;
    serviceTitle: string;
    agreementUrl: string;
  }) => ({
    subject: `🚫 Acuerdo cancelado - ${data.serviceTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #64748b, #475569); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚫 Acuerdo Cancelado</h1>
          <p style="color: #cbd5e1; margin: 5px 0 0 0;">Notificación de cancelación</p>
        </div>

        <div style="background: white; padding: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0;">Acuerdo Cancelado</h2>

          <div style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #374151;"><strong>Servicio:</strong> ${data.serviceTitle}</p>
            <p style="margin: 0 0 10px 0; color: #374151;"><strong>Cancelado por:</strong> ${data.cancellerName}</p>
            <p style="margin: 0; color: #374151;"><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-MX')}</p>
          </div>

          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-weight: bold;">ℹ️ Información</p>
            <p style="margin: 5px 0 0 0; color: #92400e;">El acuerdo ha sido cancelado. Si tenías un adelanto, será reembolsado según los términos del acuerdo.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.agreementUrl}"
               style="background: #64748b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              📋 Ver Detalles
            </a>
          </div>
        </div>
      </div>
    `
  })
};

// Función principal para enviar emails
export const sendEmail = async (to: string, template: string, data: any) => {
  try {
    const transporter = createTransporter();
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 Email configurado en modo desarrollo - no se enviará email real');
      console.log('📧 Email que se habría enviado:', {
        to,
        subject: emailTemplates[template as keyof typeof emailTemplates](data).subject,
        template
      });
      return { success: true, message: 'Email simulado (modo desarrollo)' };
    }

    const emailContent = emailTemplates[template as keyof typeof emailTemplates](data);
    
    const info = await transporter.sendMail({
      from: `"TrabajoFácil" <${process.env.SMTP_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log('📧 Email enviado exitosamente:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// Funciones específicas para cada tipo de notificación
export const emailNotifications = {
  // Nuevo mensaje
  newMessage: async (recipientEmail: string, recipientName: string, senderName: string, messageContent: string, serviceTitle: string) => {
    const messageUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/messages`;
    return sendEmail(recipientEmail, 'newMessage', {
      recipientName,
      senderName,
      messageContent,
      serviceTitle,
      messageUrl
    });
  },

  // Acuerdo creado
  agreementCreated: async (clientEmail: string, clientName: string, providerName: string, serviceTitle: string, agreedPrice: number, advancePayment?: number) => {
    const agreementUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/agreements`;
    return sendEmail(clientEmail, 'agreementCreated', {
      clientName,
      providerName,
      serviceTitle,
      agreedPrice,
      advancePayment,
      agreementUrl
    });
  },

  // Acuerdo aceptado
  agreementAccepted: async (providerEmail: string, providerName: string, clientName: string, serviceTitle: string) => {
    const agreementUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/agreements`;
    return sendEmail(providerEmail, 'agreementAccepted', {
      providerName,
      clientName,
      serviceTitle,
      agreementUrl
    });
  },

  // Trabajo completado
  workCompleted: async (clientEmail: string, providerEmail: string, providerName: string, clientName: string, serviceTitle: string, totalAmount: number) => {
    const agreementUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/agreements`;
    
    // Enviar a ambos usuarios
    const clientEmailResult = await sendEmail(clientEmail, 'workCompleted', {
      providerName,
      clientName,
      serviceTitle,
      totalAmount,
      agreementUrl
    });

    const providerEmailResult = await sendEmail(providerEmail, 'workCompleted', {
      providerName,
      clientName,
      serviceTitle,
      totalAmount,
      agreementUrl
    });

    return { clientEmailResult, providerEmailResult };
  },

  // Disputa creada
  disputeCreated: async (adminEmail: string, reportedBy: string, otherParty: string, serviceTitle: string, reason: string) => {
    const disputeUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/disputes`;
    return sendEmail(adminEmail, 'disputeCreated', {
      reportedBy,
      otherParty,
      serviceTitle,
      reason,
      disputeUrl
    });
  },

  // Acuerdo cancelado
  agreementCancelled: async (recipientEmail: string, recipientName: string, cancellerName: string, serviceTitle: string) => {
    const agreementUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/agreements`;
    return sendEmail(recipientEmail, 'agreementCancelled', {
      recipientName,
      cancellerName,
      serviceTitle,
      agreementUrl
    });
  }
};
