const express = require('express');
const router = express.Router();
const { login, getMe, changePassword, initAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginValidator, changePasswordValidator } = require('../validators/authValidators');

router.get('/init-admin', initAdmin);
router.post('/init-admin', initAdmin);
router.post('/login', validate(loginValidator), login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, validate(changePasswordValidator), changePassword);

module.exports = router;
