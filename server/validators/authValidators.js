const { body } = require('express-validator');

const loginValidator = [
  body('email')
    .notEmpty().withMessage('Email or phone is required')
    .trim(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isString(),
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

module.exports = { loginValidator, changePasswordValidator };
