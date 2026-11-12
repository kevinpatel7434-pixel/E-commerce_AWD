import { Router } from 'express';
import { createProduct, getAllProductsAdmin, getCategories, getProduct, getProducts, setProductActive, updateProduct } from '../controllers/productController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { uploadProductImage } from '../middleware/productImageUpload.js';
const router = Router();
router.get('/', getProducts); router.get('/categories', getCategories); router.get('/admin/all', protect, adminOnly, getAllProductsAdmin); router.get('/:id', getProduct);
router.post('/', protect, adminOnly, uploadProductImage, createProduct); router.put('/:id', protect, adminOnly, uploadProductImage, updateProduct); router.patch('/:id/active', protect, adminOnly, setProductActive);
export default router;
