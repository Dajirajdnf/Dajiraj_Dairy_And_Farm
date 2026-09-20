const express = require('express');
const router = express.Router();
const { login, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginValidator, changePasswordValidator } = require('../validators/authValidators');

router.post('/login', validate(loginValidator), login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, validate(changePasswordValidator), changePassword);

module.exports = router;
