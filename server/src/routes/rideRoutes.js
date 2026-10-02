import { Router } from 'express';
import { cancelRide, completeRide, createRide, getMyRides, getRide, listRides } from '../controllers/rideController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', listRides);
router.get('/mine', protect, getMyRides);
router.post('/', protect, createRide);
router.get('/:rideId', getRide);
router.patch('/:rideId/cancel', protect, cancelRide);
router.patch('/:rideId/complete', protect, completeRide);
export default router;
