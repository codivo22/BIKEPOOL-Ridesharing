import { Router } from 'express';
import { createBike, getMyBikes, updateBike } from '../controllers/bikeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);
router.route('/').get(getMyBikes).post(createBike);
router.patch('/:bikeId', updateBike);
export default router;
