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
    const userRole = req.user?.role;
    const isAuthorized = roles.includes(userRole) ||
      (roles.includes('delivery') && userRole === 'delivery_boy') ||
      (roles.includes('delivery_boy') && userRole === 'delivery');

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};

// Check specific permission (for staff)
const checkPermission = (permission) => {
  return (req, res, next) => {
    // Admins always have all permissions
    if (req.user?.role === 'admin') {
      return next();
    }

    // Staff need specific permission
    if (req.user?.role === 'staff' && req.user.permissions) {
      const perms = req.user.permissions;
      let hasPerm = false;

      if (Array.isArray(perms)) {
        hasPerm = perms.includes(permission);
        if (permission === 'products' && (perms.includes('products') || perms.includes('stock'))) hasPerm = true;
        if (permission === 'stock' && (perms.includes('stock') || perms.includes('products'))) hasPerm = true;
        if (permission === 'billing' && (perms.includes('billing') || perms.includes('invoices'))) hasPerm = true;
        if (permission === 'invoices' && (perms.includes('invoices') || perms.includes('billing'))) hasPerm = true;
      } else {
        hasPerm = Boolean(perms[permission]);
        if (permission === 'products' && (perms.products || perms.stock)) hasPerm = true;
        if (permission === 'stock' && (perms.stock || perms.products)) hasPerm = true;
        if (permission === 'billing' && (perms.billing || perms.invoices)) hasPerm = true;
        if (permission === 'invoices' && (perms.invoices || perms.billing)) hasPerm = true;
      }

      if (hasPerm) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to perform this action.',
    });
  };
};

module.exports = { protect, authorize, checkPermission };
