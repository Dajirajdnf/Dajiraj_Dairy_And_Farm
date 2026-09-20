const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

const isValidObjectId = (value) => {
  if (!value) return true; // optional field
  return mongoose.Types.ObjectId.isValid(value);
};

const createCustomerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid 10-digit Indian mobile number'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Invalid email address'),
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required'),
  body('googleMapsLink')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_protocol: true }).withMessage('Invalid Google Maps link'),
  body('dailyMilkQuantityMl')
    .notEmpty().withMessage('Daily milk quantity is required')
    .isFloat({ min: 0 }).withMessage('Quantity cannot be negative')
    .toFloat(),
  body('milkRate')
    .notEmpty().withMessage('Milk rate is required')
    .isFloat({ min: 0 }).withMessage('Rate cannot be negative')
    .toFloat(),
  body('assignedStaff')
    .optional({ checkFalsy: true })
    .custom(isValidObjectId).withMessage('Invalid staff ID'),
  body('assignedDeliveryBoy')
    .optional({ checkFalsy: true })
    .custom(isValidObjectId).withMessage('Invalid delivery boy ID'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

const updateCustomerValidator = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val)).withMessage('Invalid customer ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1–100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid 10-digit Indian mobile number'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Invalid email address'),
  body('address')
    .optional()
    .trim()
    .notEmpty().withMessage('Address cannot be empty'),
  body('googleMapsLink')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_protocol: true }).withMessage('Invalid Google Maps link'),
  body('dailyMilkQuantityMl')
    .optional()
    .isFloat({ min: 0 }).withMessage('Quantity cannot be negative')
    .toFloat(),
  body('milkRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Rate cannot be negative')
    .toFloat(),
  body('assignedStaff')
    .optional({ checkFalsy: true })
    .custom(isValidObjectId).withMessage('Invalid staff ID'),
  body('assignedDeliveryBoy')
    .optional({ checkFalsy: true })
    .custom(isValidObjectId).withMessage('Invalid delivery boy ID'),
  body('active')
    .optional()
    .isBoolean().withMessage('Active must be true or false'),
];

const reorderCustomerValidator = [
  body('orders')
    .isArray({ min: 1 }).withMessage('Orders must be a non-empty array'),
  body('orders.*.customerId')
    .custom((val) => mongoose.Types.ObjectId.isValid(val)).withMessage('Invalid customer ID in order'),
  body('orders.*.deliveryOrder')
    .isInt({ min: 0 }).withMessage('Delivery order must be a non-negative integer'),
];

module.exports = { createCustomerValidator, updateCustomerValidator, reorderCustomerValidator };
