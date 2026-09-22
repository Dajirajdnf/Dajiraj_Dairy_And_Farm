const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const createStaffValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid 10-digit Indian mobile number'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Address cannot exceed 300 characters'),
  body('permissions')
    .optional()
    .custom((val) => {
      if (typeof val === 'object' && val !== null) {
        return true;
      }
      throw new Error('Permissions must be an object or array');
    }),
];

const updateStaffValidator = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val)).withMessage('Invalid staff ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1–100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid 10-digit Indian mobile number'),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('active')
    .optional()
    .isBoolean().withMessage('Active must be true or false'),
  body('permissions')
    .optional()
    .custom((val) => {
      if (typeof val === 'object' && val !== null) {
        return true;
      }
      throw new Error('Permissions must be an object or array');
    }),
];

const createDeliveryBoyValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid 10-digit Indian mobile number'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Address cannot exceed 300 characters'),
  body('vehicleInfo')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Vehicle info cannot exceed 100 characters'),
  body('assignedArea')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Assigned area cannot exceed 200 characters'),
];

const updateDeliveryBoyValidator = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val)).withMessage('Invalid delivery boy ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1–100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid 10-digit Indian mobile number'),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('active')
    .optional()
    .isBoolean().withMessage('Active must be true or false'),
];

module.exports = {
  createStaffValidator,
  updateStaffValidator,
  createDeliveryBoyValidator,
  updateDeliveryBoyValidator,
};
