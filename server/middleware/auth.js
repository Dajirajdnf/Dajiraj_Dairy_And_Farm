const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

// Verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - no token provided',
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - user not found',
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact admin.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - invalid token',
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

// Check specific permission (for staff)
const checkPermission = (permission) => {
  return (req, res, next) => {
    // Admins always have all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Staff need specific permission
    if (req.user.role === 'staff' && req.user.permissions && req.user.permissions[permission]) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `You don't have permission for '${permission}'`,
    });
  };
};

module.exports = { protect, authorize, checkPermission };
