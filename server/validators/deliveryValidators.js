const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const VALID_STATUSES = ['Pending', 'Delivered', 'Skipped', 'Cancelled', 'Corrected'];

const adjustQuantityValidator = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val)).withMessage('Invalid delivery ID'),
  body('action')
    .notEmpty().withMessage('Action is required')
    .isIn(['increase', 'decrease']).withMessage('Action must be increase or decrease'),
];

const markCompleteValidator = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val)).withMessage('Invalid delivery ID'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Notes cannot exceed 300 characters'),
];

const updateStatusValidator = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val)).withMessage('Invalid delivery ID'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('finalQuantityMl')
    .optional()
    .isFloat({ min: 0 }).withMessage('Quantity cannot be negative')
    .toFloat(),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Notes cannot exceed 300 characters'),
];

module.exports = { adjustQuantityValidator, markCompleteValidator, updateStatusValidator };
