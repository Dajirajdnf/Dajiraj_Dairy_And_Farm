const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createInquiryValidator } = require('../validators/inquiryValidators');
const { getInquiries, createInquiry, updateInquiry, deleteInquiry } = require('../controllers/inquiryController');

// Strict rate limiter for public inquiry form
const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many inquiries submitted. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public route — rate limited + validated
router.post('/', inquiryLimiter, validate(createInquiryValidator), createInquiry);

// Protected routes
router.use(protect);
router.use(authorize('admin', 'staff'));

router.get('/', checkPermission('inquiries'), getInquiries);
router.patch('/:id', checkPermission('inquiries'), updateInquiry);
router.delete('/:id', authorize('admin'), deleteInquiry);

module.exports = router;
