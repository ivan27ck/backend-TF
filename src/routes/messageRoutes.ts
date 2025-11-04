import { Router } from 'express';
import { getMessages, sendMessage, markMessageAsRead, getConversationMessages } from '../controllers/messageController';

const router = Router();

router.get('/', getMessages);
router.get('/:otherUserId', getConversationMessages); // New route for conversation messages
router.post('/', sendMessage);
router.put('/:id/read', markMessageAsRead);

export default router;
