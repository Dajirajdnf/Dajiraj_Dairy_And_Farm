const User = require('../models/User');
const mongoose = require('mongoose');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all staff
// @route   GET /api/staff
const getStaff = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const query = { role: 'staff' };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (status === 'active') query.active = true;
    if (status === 'inactive') query.active = false;

    const total = await User.countDocuments(query);
    const staff = await User.find(query)
      .sort('-createdAt')
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.json({
      success: true,
      data: staff,
      pagination: {
        total,
        page: parsedPage,
        pages: Math.ceil(total / parsedLimit),
        limit: parsedLimit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single staff
// @route   GET /api/staff/:id
const getStaffById = async (req, res, next) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Create staff
// @route   POST /api/staff
const createStaff = async (req, res, next) => {
  try {
    // Explicit field whitelist — prevents mass assignment
    const { name, email, phone, password, address, permissions } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Whitelist and normalize permission keys
    const parsePermissions = (perms) => {
      if (Array.isArray(perms)) {
        return {
          customers: perms.includes('customers'),
          deliveries: perms.includes('deliveries'),
          stock: perms.includes('stock') || perms.includes('products'),
          products: perms.includes('products') || perms.includes('stock'),
          invoices: perms.includes('invoices') || perms.includes('billing'),
          billing: perms.includes('billing') || perms.includes('invoices'),
          inquiries: perms.includes('inquiries'),
          reports: perms.includes('reports'),
        };
      }
      return {
        customers: Boolean(perms?.customers),
        deliveries: Boolean(perms?.deliveries),
        stock: Boolean(perms?.stock || perms?.products),
        products: Boolean(perms?.products || perms?.stock),
        invoices: Boolean(perms?.invoices || perms?.billing),
        billing: Boolean(perms?.billing || perms?.invoices),
        inquiries: Boolean(perms?.inquiries),
        reports: Boolean(perms?.reports),
      };
    };

    const safePermissions = parsePermissions(permissions);

    const staff = await User.create({
      name,
      email,
      phone,
      passwordHash: password,
      address: address || '',
      role: 'staff', // Always set server-side
      permissions: safePermissions,
    });

    logAudit({
      action: 'STAFF_CREATED',
      resourceType: 'User',
      resourceId: staff._id,
      details: `Staff ${staff.name} (${staff.email}) created`,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Staff created successfully',
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff
// @route   PUT /api/staff/:id
const updateStaff = async (req, res, next) => {
  try {
    // Explicit field whitelist — prevents mass assignment and role escalation
    const { name, email, phone, address, permissions, active, password } = req.body;

    const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    if (email && email !== staff.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }

    if (name) staff.name = name;
    if (email) staff.email = email;
    if (phone) staff.phone = phone;
    if (address !== undefined) staff.address = address;
    if (active !== undefined) staff.active = Boolean(active);
    if (password) staff.passwordHash = password;
    // Whitelist permissions keys
    if (permissions) {
      if (Array.isArray(permissions)) {
        staff.permissions = {
          customers: permissions.includes('customers'),
          deliveries: permissions.includes('deliveries'),
          stock: permissions.includes('stock') || permissions.includes('products'),
          products: permissions.includes('products') || permissions.includes('stock'),
          invoices: permissions.includes('invoices') || permissions.includes('billing'),
          billing: permissions.includes('billing') || permissions.includes('invoices'),
          inquiries: permissions.includes('inquiries'),
          reports: permissions.includes('reports'),
        };
      } else {
        staff.permissions = {
          customers: Boolean(permissions.customers),
          deliveries: Boolean(permissions.deliveries),
          stock: Boolean(permissions.stock || permissions.products),
          products: Boolean(permissions.products || permissions.stock),
          invoices: Boolean(permissions.invoices || permissions.billing),
          billing: Boolean(permissions.billing || permissions.invoices),
          inquiries: Boolean(permissions.inquiries),
          reports: Boolean(permissions.reports),
        };
      }
    }
    // role is NOT updatable here — prevents privilege escalation

    await staff.save();

    logAudit({
      action: 'STAFF_UPDATED',
      resourceType: 'User',
      resourceId: staff._id,
      details: `Staff ${staff.name} updated`,
      req,
    });

    res.json({
      success: true,
      message: 'Staff updated successfully',
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete staff
// @route   DELETE /api/staff/:id
const deleteStaff = async (req, res, next) => {
  try {
    if (req.user && req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    logAudit({
      action: 'STAFF_DELETED',
      resourceType: 'User',
      resourceId: staff._id,
      details: `Staff ${staff.name} permanently deleted`,
      req,
    });

    res.json({ success: true, message: 'Staff member permanently deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle staff active status
// @route   PATCH /api/staff/:id/status
const toggleStaffStatus = async (req, res, next) => {
  try {
    if (req.user && req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot change your own status' });
    }

    const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    const newActive = req.body.active !== undefined ? Boolean(req.body.active) : !staff.active;
    staff.active = newActive;
    await staff.save();

    logAudit({
      action: newActive ? 'STAFF_ACTIVATED' : 'STAFF_DEACTIVATED',
      resourceType: 'User',
      resourceId: staff._id,
      details: `Staff ${staff.name} marked as ${newActive ? 'Active' : 'Inactive'}`,
      req,
    });

    res.json({
      success: true,
      message: `Staff member marked as ${newActive ? 'Active' : 'Inactive'}`,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStaff, getStaffById, createStaff, updateStaff, deleteStaff, toggleStaffStatus };
