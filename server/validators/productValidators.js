const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const VALID_CATEGORIES = ['Milk', 'Curd', 'Paneer', 'Buttermilk', 'Ghee', 'Other Dairy Products'];

const createProductValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  body('unit')
    .trim()
    .notEmpty().withMessage('Unit is required'),
  body('sellingPrice')
    .notEmpty().withMessage('Selling price is required')
    .isFloat({ min: 0 }).withMessage('Price cannot be negative')
    .toFloat(),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Purchase price cannot be negative')
    .toFloat(),
  body('currentStock')
    .optional()
    .isFloat({ min: 0 }).withMessage('Stock cannot be negative')
    .toFloat(),
  body('minimumStock')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum stock cannot be negative')
    .toFloat(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('sku')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('SKU cannot exceed 50 characters'),
];

const updateProductValidator = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val)).withMessage('Invalid product ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1–100 characters'),
  body('category')
    .optional()
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  body('sellingPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price cannot be negative')
    .toFloat(),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Purchase price cannot be negative')
    .toFloat(),
  body('currentStock')
    .optional()
    .isFloat({ min: 0 }).withMessage('Stock cannot be negative')
    .toFloat(),
  body('minimumStock')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum stock cannot be negative')
    .toFloat(),
  body('active')
    .optional()
    .isBoolean().withMessage('Active must be true or false'),
];

const adjustStockValidator = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val)).withMessage('Invalid product ID'),
  body('type')
    .notEmpty().withMessage('Stock type is required')
    .isIn(['in', 'out', 'adjustment']).withMessage('Type must be in, out, or adjustment'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isFloat().withMessage('Quantity must be a number')
    .toFloat(),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters'),
];

module.exports = { createProductValidator, updateProductValidator, adjustStockValidator };
