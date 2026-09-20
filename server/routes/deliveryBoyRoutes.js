const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createDeliveryBoyValidator, updateDeliveryBoyValidator } = require('../validators/staffValidators');
const {
  getDeliveryBoys, getDeliveryBoyById, createDeliveryBoy, updateDeliveryBoy, deleteDeliveryBoy,
} = require('../controllers/deliveryBoyController');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getDeliveryBoys);
router.post('/', validate(createDeliveryBoyValidator), createDeliveryBoy);
router.get('/:id', getDeliveryBoyById);
router.put('/:id', validate(updateDeliveryBoyValidator), updateDeliveryBoy);
router.delete('/:id', deleteDeliveryBoy);

module.exports = router;
