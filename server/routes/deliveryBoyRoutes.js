const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createDeliveryBoyValidator, updateDeliveryBoyValidator } = require('../validators/staffValidators');
const {
  getDeliveryBoys, getDeliveryBoyById, createDeliveryBoy, updateDeliveryBoy, deleteDeliveryBoy, toggleDeliveryBoyStatus,
} = require('../controllers/deliveryBoyController');

router.use(protect);

router.get('/', authorize('admin', 'staff'), getDeliveryBoys);
router.post('/', authorize('admin'), validate(createDeliveryBoyValidator), createDeliveryBoy);
router.get('/:id', authorize('admin', 'staff'), getDeliveryBoyById);
router.put('/:id', authorize('admin'), validate(updateDeliveryBoyValidator), updateDeliveryBoy);
router.patch('/:id/status', authorize('admin'), toggleDeliveryBoyStatus);
router.delete('/:id', authorize('admin'), deleteDeliveryBoy);

module.exports = router;
