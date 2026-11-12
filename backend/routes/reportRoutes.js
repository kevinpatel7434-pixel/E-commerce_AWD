import { Router } from 'express';
import { getSummary, getTopProducts } from '../controllers/reportController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = Router();
router.use(protect, adminOnly);
router.get('/summary', getSummary);
router.get('/top-products', getTopProducts);

export default router;
