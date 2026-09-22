const express = require('express');
const router = express.Router();
const { protect, authorize, checkPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createCustomerValidator,
  updateCustomerValidator,
  reorderCustomerValidator,
} = require('../validators/customerValidators');
const {
  getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, toggleCustomerStatus, reorderCustomers,
} = require('../controllers/customerController');

router.use(protect);
router.use(authorize('admin', 'staff'));

router.get('/', checkPermission('customers'), getCustomers);
router.post('/', checkPermission('customers'), validate(createCustomerValidator), createCustomer);
router.put('/reorder', checkPermission('customers'), validate(reorderCustomerValidator), reorderCustomers);
router.get('/:id', checkPermission('customers'), getCustomer);
router.put('/:id', checkPermission('customers'), validate(updateCustomerValidator), updateCustomer);
router.patch('/:id/status', checkPermission('customers'), toggleCustomerStatus);
router.delete('/:id', checkPermission('customers'), deleteCustomer);

module.exports = router;
