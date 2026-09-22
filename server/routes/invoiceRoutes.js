const express = require('express');
const router = express.Router();
const { protect, authorize, checkPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { generateInvoiceValidator, updatePaymentValidator } = require('../validators/invoiceValidators');
const { getInvoices, getInvoice, generateInvoice, updatePayment, getInvoicePdf, getInvoiceHtml, sendInvoiceEmail } = require('../controllers/invoiceController');

router.use(protect);
router.use(authorize('admin', 'staff'));

router.get('/', checkPermission('invoices'), getInvoices);
router.post('/generate', checkPermission('invoices'), validate(generateInvoiceValidator), generateInvoice);
router.get('/:id', checkPermission('invoices'), getInvoice);
router.get('/:id/pdf', checkPermission('invoices'), getInvoicePdf);
router.get('/:id/html', checkPermission('invoices'), getInvoiceHtml);
router.post('/:id/email', checkPermission('invoices'), sendInvoiceEmail);
router.patch('/:id/payment', checkPermission('invoices'), validate(updatePaymentValidator), updatePayment);

module.exports = router;
