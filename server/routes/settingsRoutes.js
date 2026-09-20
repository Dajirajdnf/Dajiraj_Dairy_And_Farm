const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { updateSettings, getSettings, testSmtp, getPublicSettings } = require('../controllers/settingsController');
const validate = require('../middleware/validate');
const { updateSettingsValidator } = require('../validators/settingsValidators');

// Public route
router.get('/public', getPublicSettings);

// Protected routes
router.use(protect);
router.use(authorize('admin'));

router.get('/', getSettings);
router.put('/', validate(updateSettingsValidator), updateSettings);
router.post('/test-smtp', testSmtp);

module.exports = router;
