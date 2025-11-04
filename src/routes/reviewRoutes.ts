import { Router } from 'express';
import { getReviews, createReview } from '../controllers/reviewController';

const router = Router();

router.get('/', getReviews);
router.post('/', createReview);

export default router;
