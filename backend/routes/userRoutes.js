import { Router } from 'express';
import { adminOnly, protect } from '../middleware/auth.js';
import { listUsers, setUserActive, updateUser } from '../controllers/userController.js';

const router = Router();
router.use(protect, adminOnly);
router.get('/', listUsers);
const primaryAdminOnly = (req, res, next) => {
    if (req.user?.email?.trim().toLowerCase() !== 'admin@electromart.com') {
        return res.status(403).json({ message: 'Primary admin access required to manage users' });
    }
    next();
};
router.patch('/:id/active', primaryAdminOnly, setUserActive);
router.patch('/:id', primaryAdminOnly, updateUser);

export default router;
