const express = require('express');
const router = express.Router();
const { protect, authorize, checkPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createProductValidator, updateProductValidator, adjustStockValidator } = require('../validators/productValidators');
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  adjustStock, getStockHistory, getLowStockProducts,
} = require('../controllers/productController');

// Public route for products (website display)
router.get('/public', getProducts);

// Protected routes
router.use(protect);

router.get('/low-stock', authorize('admin', 'staff'), checkPermission('stock'), getLowStockProducts);
router.get('/', authorize('admin', 'staff'), getProducts);
router.post('/', authorize('admin'), validate(createProductValidator), createProduct);
router.get('/:id', authorize('admin', 'staff'), getProduct);
router.put('/:id', authorize('admin'), validate(updateProductValidator), updateProduct);
router.delete('/:id', authorize('admin'), deleteProduct);
router.post('/:id/stock', authorize('admin', 'staff'), checkPermission('stock'), validate(adjustStockValidator), adjustStock);
router.get('/:id/stock-history', authorize('admin', 'staff'), checkPermission('stock'), getStockHistory);

module.exports = router;
