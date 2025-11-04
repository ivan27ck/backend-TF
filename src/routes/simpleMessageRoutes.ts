import { Router } from 'express';
import { sendSimpleMessage, getSimpleMessages, getUserConversations, searchUsers } from '../controllers/simpleMessageController';

const router = Router();

// Enviar mensaje simple - SIN AUTENTICACIÓN
router.post('/send', sendSimpleMessage);

// Obtener mensajes entre dos usuarios - SIN AUTENTICACIÓN  
router.get('/conversation/:userId1/:userId2', getSimpleMessages);

// Obtener conversaciones de un usuario (estilo WhatsApp) - SIN AUTENTICACIÓN
router.get('/conversations/:userId', getUserConversations);

// Buscar usuarios para iniciar nuevas conversaciones - SIN AUTENTICACIÓN
router.get('/search-users', searchUsers);

export default router;
