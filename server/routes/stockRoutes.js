const express = require('express');
const router = express.Router();
const { protect, authorize, checkPermission } = require('../middleware/auth');
const {
  getStockList,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
} = require('../controllers/stockController');

// All stock routes are protected and require stock permission for staff
router.use(protect);
router.use(authorize('admin', 'staff'));
router.use(checkPermission('stock'));

router.get('/', getStockList);
router.post('/', createStock);
router.get('/:id', getStockById);
router.put('/:id', updateStock);
router.delete('/:id', deleteStock);

module.exports = router;
