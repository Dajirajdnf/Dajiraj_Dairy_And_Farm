const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { logAudit } = require('../utils/auditLogger');

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // If no admin exists in the system (e.g. fresh database deployment), bootstrap default admin
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@dajiraj.com',
        phone: process.env.ADMIN_PHONE || '9876543210',
        passwordHash: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        active: true,
      });
    }

    // Find user by email or phone and include password
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone: email }
      ]
    }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact admin.',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.role);

    logAudit({
      userId: user._id,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user._id,
      details: `User ${user.name} logged in (${user.role})`,
      req,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          permissions: user.permissions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters',
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.passwordHash = newPassword;
    await user.save();

    logAudit({
      userId: req.user._id,
      action: 'PASSWORD_CHANGED',
      resourceType: 'User',
      resourceId: req.user._id,
      details: `Password changed for user ${req.user.name || req.user._id}`,
      req,
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initialize Super Admin account (safe one-click bootstrap)
// @route   GET /api/auth/init-admin
const initAdmin = async (req, res, next) => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Admin account already exists in your database',
        admin: {
          name: existingAdmin.name,
          email: existingAdmin.email,
          phone: existingAdmin.phone,
        },
      });
    }

    const email = (process.env.ADMIN_EMAIL || 'admin@dajiraj.com').toLowerCase();
    const phone = process.env.ADMIN_PHONE || '9876543210';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    const admin = await User.create({
      name: 'Super Admin',
      email,
      phone,
      passwordHash: password,
      role: 'admin',
      active: true,
    });

    const Settings = require('../models/Settings');
    await Settings.getSettings();

    res.status(201).json({
      success: true,
      message: 'Super Admin successfully created in your database!',
      credentials: {
        email: admin.email,
        phone: admin.phone,
        password: password,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe, changePassword, initAdmin };
