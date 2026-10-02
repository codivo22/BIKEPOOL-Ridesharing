import { Router } from 'express';
import { createReport, getMyReports } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);
router.route('/').post(createReport).get(getMyReports);
export default router;
