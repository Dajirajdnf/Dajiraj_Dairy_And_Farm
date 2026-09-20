const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createStaffValidator, updateStaffValidator } = require('../validators/staffValidators');
const { getStaff, getStaffById, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getStaff);
router.post('/', validate(createStaffValidator), createStaff);
router.get('/:id', getStaffById);
router.put('/:id', validate(updateStaffValidator), updateStaff);
router.delete('/:id', deleteStaff);

module.exports = router;
