const express = require('express');
const router = express.Router();
const { protect, authorize, checkPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { adjustQuantityValidator, markCompleteValidator, updateStatusValidator } = require('../validators/deliveryValidators');
const {
  generateTodayDeliveries, getTodayDeliveries, getDeliveries,
  adjustQuantity, markComplete, updateDeliveryStatus, getDeliveryBoyDashboard,
} = require('../controllers/deliveryController');

router.use(protect);

// Helper middleware: staff needs deliveries permission, delivery boys allowed
const requireDeliveryStaffOrBoy = (req, res, next) => {
  if (req.user?.role === 'staff') {
    return checkPermission('deliveries')(req, res, next);
  }
  next();
};

// Delivery boy dashboard
router.get('/my-dashboard', authorize('delivery', 'delivery_boy'), getDeliveryBoyDashboard);

// Generate today's deliveries (admin/staff with deliveries permission)
router.post('/generate-today', authorize('admin', 'staff'), checkPermission('deliveries'), generateTodayDeliveries);

// Today's deliveries
router.get('/today', authorize('admin', 'staff', 'delivery', 'delivery_boy'), requireDeliveryStaffOrBoy, getTodayDeliveries);

// All deliveries with filters
router.get('/', authorize('admin', 'staff', 'delivery', 'delivery_boy'), requireDeliveryStaffOrBoy, getDeliveries);

// Quantity adjustment (+/- 250ml)
router.patch('/:id/quantity', authorize('admin', 'staff', 'delivery', 'delivery_boy'), requireDeliveryStaffOrBoy, validate(adjustQuantityValidator), adjustQuantity);

// Mark delivery complete
router.patch('/:id/complete', authorize('admin', 'staff', 'delivery', 'delivery_boy'), requireDeliveryStaffOrBoy, validate(markCompleteValidator), markComplete);

// Status update / correction
router.patch('/:id/status', authorize('admin', 'staff'), checkPermission('deliveries'), validate(updateStatusValidator), updateDeliveryStatus);

module.exports = router;
