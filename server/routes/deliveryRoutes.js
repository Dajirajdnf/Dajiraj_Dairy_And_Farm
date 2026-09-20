const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { adjustQuantityValidator, markCompleteValidator, updateStatusValidator } = require('../validators/deliveryValidators');
const {
  generateTodayDeliveries, getTodayDeliveries, getDeliveries,
  adjustQuantity, markComplete, updateDeliveryStatus, getDeliveryBoyDashboard,
} = require('../controllers/deliveryController');

router.use(protect);

// Delivery boy dashboard
router.get('/my-dashboard', authorize('delivery'), getDeliveryBoyDashboard);

// Generate today's deliveries (admin/staff)
router.post('/generate-today', authorize('admin', 'staff'), generateTodayDeliveries);

// Today's deliveries
router.get('/today', authorize('admin', 'staff', 'delivery'), getTodayDeliveries);

// All deliveries with filters
router.get('/', authorize('admin', 'staff', 'delivery'), getDeliveries);

// Quantity adjustment (+/- 250ml)
router.patch('/:id/quantity', authorize('admin', 'staff', 'delivery'), validate(adjustQuantityValidator), adjustQuantity);

// Mark delivery complete
router.patch('/:id/complete', authorize('admin', 'staff', 'delivery'), validate(markCompleteValidator), markComplete);

// Admin correction
router.patch('/:id/status', authorize('admin'), validate(updateStatusValidator), updateDeliveryStatus);

module.exports = router;
