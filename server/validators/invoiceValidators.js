const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const generateInvoiceValidator = [
  body('customerId')
    .notEmpty().withMessage('Customer ID is required')
    .custom((val) => mongoose.Types.ObjectId.isValid(val)).withMessage('Invalid customer ID'),
  body('billingMonth')
    .optional()
    .isInt({ min: 0, max: 11 }).withMessage('Billing month must be 0–11')
    .toInt(),
  body('billingYear')
    .optional()
    .isInt({ min: 2020, max: 2100 }).withMessage('Invalid billing year')
    .toInt(),
  body('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid date'),
];

const updatePaymentValidator = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val)).withMessage('Invalid invoice ID'),
  body('paidAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Paid amount cannot be negative')
    .toFloat(),
  body('paymentMethod')
    .optional()
    .trim()
    .isIn(['', 'Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'])
    .withMessage('Invalid payment method'),
  body('paymentNotes')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Payment notes cannot exceed 300 characters'),
  body('paymentStatus')
    .optional()
    .isIn(['Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Void'])
    .withMessage('Invalid payment status'),
];

module.exports = { generateInvoiceValidator, updatePaymentValidator };
