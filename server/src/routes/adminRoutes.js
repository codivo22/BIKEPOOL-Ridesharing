import { Router } from 'express';
import { getDashboard, listActivity, listReports, listReviews, listUsers, removeReview, updateReport, updateUserStatus } from '../controllers/adminController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect, adminOnly);
router.get('/dashboard', getDashboard);
router.get('/users', listUsers);
router.patch('/users/:userId/status', updateUserStatus);
router.get('/reports', listReports);
router.patch('/reports/:reportId', updateReport);
router.get('/activity', listActivity);
router.get('/reviews', listReviews);
router.delete('/reviews/:reviewId', removeReview);
export default router;
