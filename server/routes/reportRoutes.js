const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getMilkReport, getRevenueReport, getCustomerReport, getDeliveryReport, getStockReport } = require('../controllers/reportController');

router.use(protect);
router.use(authorize('admin'));

router.get('/milk', getMilkReport);
router.get('/revenue', getRevenueReport);
router.get('/customers', getCustomerReport);
router.get('/delivery', getDeliveryReport);
router.get('/stock', getStockReport);

module.exports = router;
