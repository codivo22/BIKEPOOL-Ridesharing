import { Router } from 'express';
import { getMe, getPublicProfile, login, register, updateMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.get('/users/:userId', getPublicProfile);
export default router;
