const express = require('express');
const router = express.Router();
const { protect, authorize, checkPermission } = require('../middleware/auth');
const { getMilkReport, getRevenueReport, getCustomerReport, getDeliveryReport, getStockReport } = require('../controllers/reportController');

router.use(protect);
router.use(authorize('admin', 'staff'));
router.use(checkPermission('reports'));

router.get('/milk', getMilkReport);
router.get('/revenue', getRevenueReport);
router.get('/customers', getCustomerReport);
router.get('/delivery', getDeliveryReport);
router.get('/stock', getStockReport);

module.exports = router;
