const { body } = require('express-validator');

const createInquiryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters')
    // Strip HTML tags
    .customSanitizer((val) => val.replace(/<[^>]*>/g, '')),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid 10-digit Indian mobile number'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Invalid email address'),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Message must be 10–1000 characters')
    .customSanitizer((val) => val.replace(/<[^>]*>/g, '')),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Subject cannot exceed 200 characters')
    .customSanitizer((val) => val.replace(/<[^>]*>/g, '')),
  body('product')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Product field cannot exceed 100 characters'),
];

module.exports = { createInquiryValidator };
