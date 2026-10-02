import { Router } from 'express';
import { cancelBooking, createBooking, getMyBookings, getReceivedBookings, respondToBooking } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);
router.post('/', createBooking);
router.get('/mine', getMyBookings);
router.get('/received', getReceivedBookings);
router.patch('/:bookingId/respond', respondToBooking);
router.patch('/:bookingId/cancel', cancelBooking);
export default router;
