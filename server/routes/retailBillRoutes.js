const express = require('express');
const router = express.Router();
const { protect, authorize, checkPermission } = require('../middleware/auth');
const {
  getRetailBills,
  getRetailBillById,
  createRetailBill,
  getRetailBillPdf,
  emailRetailBill,
} = require('../controllers/retailBillController');

router.use(protect);
router.use(authorize('admin', 'staff'));
router.use(checkPermission('billing'));

router.get('/', getRetailBills);
router.post('/', createRetailBill);
router.get('/:id', getRetailBillById);
router.get('/:id/pdf', getRetailBillPdf);
router.post('/:id/email', emailRetailBill);

module.exports = router;
