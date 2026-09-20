const { body } = require('express-validator');

const updateSettingsValidator = [
  body('businessName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Business name cannot exceed 100 characters'),
  body('tagline')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Tagline cannot exceed 200 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Invalid phone number'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Invalid email address'),
  body('defaultMilkRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Default milk rate cannot be negative')
    .toFloat(),
  body('deliveryAdjustmentMl')
    .optional()
    .isInt({ min: 50, max: 1000 }).withMessage('Delivery adjustment must be 50–1000 ml')
    .toInt(),
  body('invoicePrefix')
    .optional()
    .trim()
    .isLength({ max: 10 }).withMessage('Invoice prefix cannot exceed 10 characters')
    .matches(/^[A-Z0-9-]+$/).withMessage('Invoice prefix must be alphanumeric uppercase'),
  body('smtpHost')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('SMTP host too long'),
  body('smtpPort')
    .optional()
    .isInt({ min: 1, max: 65535 }).withMessage('Invalid SMTP port')
    .toInt(),
  body('smtpUser')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('SMTP user must be a valid email'),
  body('smtpPass')
    .optional()
    .isLength({ max: 200 }).withMessage('SMTP password too long'),
  body('taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be 0–100')
    .toFloat(),
  body('taxEnabled')
    .optional()
    .isBoolean().withMessage('taxEnabled must be boolean'),
  body('autoEmailInvoice')
    .optional()
    .isBoolean().withMessage('autoEmailInvoice must be boolean'),
  body('enableZeroInvoice')
    .optional()
    .isBoolean().withMessage('enableZeroInvoice must be boolean'),
];

module.exports = { updateSettingsValidator };
