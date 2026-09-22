const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const VALID_CATEGORIES = ['Milk', 'Curd', 'Paneer', 'Buttermilk', 'Ghee', 'Other Dairy Products'];

const CATEGORY_MAP = {
  milk: 'Milk',
  curd: 'Curd',
  paneer: 'Paneer',
  buttermilk: 'Buttermilk',
  ghee: 'Ghee',
  butter: 'Other Dairy Products',
  other: 'Other Dairy Products',
  'other dairy products': 'Other Dairy Products',
};

const normalizeProductBody = (req, res, next) => {
  if (req.body) {
    if (req.body.category) {
      const lower = String(req.body.category).trim().toLowerCase();
      if (CATEGORY_MAP[lower]) {
        req.body.category = CATEGORY_MAP[lower];
      }
    }
    if (req.body.currentStock === undefined && req.body.stock !== undefined) {
      req.body.currentStock = parseFloat(req.body.stock);
    }
    if (req.body.stock === undefined && req.body.currentStock !== undefined) {
      req.body.stock = parseFloat(req.body.currentStock);
    }
    if (req.body.sellingPrice === undefined && req.body.price !== undefined) {
      req.body.sellingPrice = parseFloat(req.body.price);
    }
    if (req.body.price === undefined && req.body.sellingPrice !== undefined) {
      req.body.price = parseFloat(req.body.sellingPrice);
    }
    if (req.body.minimumStock === undefined && req.body.minStockAlert !== undefined) {
      req.body.minimumStock = parseFloat(req.body.minStockAlert);
    }
    if (req.body.minStockAlert === undefined && req.body.minimumStock !== undefined) {
      req.body.minStockAlert = parseFloat(req.body.minimumStock);
    }
    if (req.body.active === undefined && req.body.isActive !== undefined) {
      req.body.active = req.body.isActive === true || req.body.isActive === 'true';
    }
    if (req.body.isActive === undefined && req.body.active !== undefined) {
      req.body.isActive = req.body.active === true || req.body.active === 'true';
    }
  }
};

const normalizeProductMiddleware = body().customSanitizer((val, { req }) => {
  normalizeProductBody(req);
  return val;
});

const createProductValidator = [
  normalizeProductMiddleware,
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('category')
    .customSanitizer((val) => {
      if (!val) return val;
      const lower = String(val).trim().toLowerCase();
      return CATEGORY_MAP[lower] || val;
    })
    .notEmpty().withMessage('Category is required')
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  body('unit')
    .trim()
    .notEmpty().withMessage('Unit is required'),
  body('sellingPrice')
    .customSanitizer((val, { req }) => {
      if (val !== undefined && val !== null && val !== '') return val;
      if (req.body.price !== undefined && req.body.price !== null && req.body.price !== '') return req.body.price;
      return val;
    })
    .notEmpty().withMessage('Selling price is required')
    .isFloat({ min: 0 }).withMessage('Price cannot be negative')
    .toFloat(),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Purchase price cannot be negative')
    .toFloat(),
  body('currentStock')
    .customSanitizer((val, { req }) => {
      if (val !== undefined && val !== null && val !== '') return val;
      if (req.body.stock !== undefined && req.body.stock !== null && req.body.stock !== '') return req.body.stock;
      return val;
    })
    .optional()
    .isFloat({ min: 0 }).withMessage('Stock cannot be negative')
    .toFloat(),
  body('minimumStock')
    .customSanitizer((val, { req }) => {
      if (val !== undefined && val !== null && val !== '') return val;
      if (req.body.minStockAlert !== undefined && req.body.minStockAlert !== null && req.body.minStockAlert !== '') return req.body.minStockAlert;
      return val;
    })
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
  normalizeProductMiddleware,
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val)).withMessage('Invalid product ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1–100 characters'),
  body('category')
    .optional()
    .customSanitizer((val) => {
      if (!val) return val;
      const lower = String(val).trim().toLowerCase();
      return CATEGORY_MAP[lower] || val;
    })
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  body('sellingPrice')
    .optional()
    .customSanitizer((val, { req }) => {
      if (val !== undefined && val !== null && val !== '') return val;
      if (req.body.price !== undefined && req.body.price !== null && req.body.price !== '') return req.body.price;
      return val;
    })
    .isFloat({ min: 0 }).withMessage('Price cannot be negative')
    .toFloat(),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Purchase price cannot be negative')
    .toFloat(),
  body('currentStock')
    .optional()
    .customSanitizer((val, { req }) => {
      if (val !== undefined && val !== null && val !== '') return val;
      if (req.body.stock !== undefined && req.body.stock !== null && req.body.stock !== '') return req.body.stock;
      return val;
    })
    .isFloat({ min: 0 }).withMessage('Stock cannot be negative')
    .toFloat(),
  body('minimumStock')
    .optional()
    .customSanitizer((val, { req }) => {
      if (val !== undefined && val !== null && val !== '') return val;
      if (req.body.minStockAlert !== undefined && req.body.minStockAlert !== null && req.body.minStockAlert !== '') return req.body.minStockAlert;
      return val;
    })
    .isFloat({ min: 0 }).withMessage('Minimum stock cannot be negative')
    .toFloat(),
  body('active')
    .optional()
    .customSanitizer((val, { req }) => {
      if (val !== undefined) return val;
      if (req.body.isActive !== undefined) return req.body.isActive;
      return val;
    })
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
