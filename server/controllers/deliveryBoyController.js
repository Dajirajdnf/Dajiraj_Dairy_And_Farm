const User = require('../models/User');
const mongoose = require('mongoose');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all delivery boys
// @route   GET /api/delivery-boys
const getDeliveryBoys = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const query = { role: 'delivery' };

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
    const deliveryBoys = await User.find(query)
      .sort('-createdAt')
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.json({
      success: true,
      data: deliveryBoys,
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

// @desc    Get single delivery boy
// @route   GET /api/delivery-boys/:id
const getDeliveryBoyById = async (req, res, next) => {
  try {
    const deliveryBoy = await User.findOne({ _id: req.params.id, role: 'delivery' });
    if (!deliveryBoy) {
      return res.status(404).json({ success: false, message: 'Delivery boy not found' });
    }
    res.json({ success: true, data: deliveryBoy });
  } catch (error) {
    next(error);
  }
};

// @desc    Create delivery boy
// @route   POST /api/delivery-boys
const createDeliveryBoy = async (req, res, next) => {
  try {
    // Explicit field whitelist — prevents mass assignment
    const { name, email, phone, password, address, vehicleInfo, assignedArea } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const deliveryBoy = await User.create({
      name,
      email,
      phone,
      passwordHash: password,
      address: address || '',
      vehicleInfo: vehicleInfo || '',
      assignedArea: assignedArea || '',
      role: 'delivery', // Always set server-side
    });

    logAudit({
      action: 'DELIVERY_BOY_CREATED',
      resourceType: 'User',
      resourceId: deliveryBoy._id,
      details: `Delivery boy ${deliveryBoy.name} created`,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Delivery boy created successfully',
      data: deliveryBoy,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery boy
// @route   PUT /api/delivery-boys/:id
const updateDeliveryBoy = async (req, res, next) => {
  try {
    // Explicit field whitelist — prevents mass assignment and role escalation
    const { name, email, phone, address, vehicleInfo, assignedArea, active, password } = req.body;

    const deliveryBoy = await User.findOne({ _id: req.params.id, role: 'delivery' });
    if (!deliveryBoy) {
      return res.status(404).json({ success: false, message: 'Delivery boy not found' });
    }

    if (email && email !== deliveryBoy.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }

    if (name) deliveryBoy.name = name;
    if (email) deliveryBoy.email = email;
    if (phone) deliveryBoy.phone = phone;
    if (address !== undefined) deliveryBoy.address = address;
    if (vehicleInfo !== undefined) deliveryBoy.vehicleInfo = vehicleInfo;
    if (assignedArea !== undefined) deliveryBoy.assignedArea = assignedArea;
    if (active !== undefined) deliveryBoy.active = Boolean(active);
    if (password) deliveryBoy.passwordHash = password;
    // role is NOT updatable here — prevents privilege escalation

    await deliveryBoy.save();

    logAudit({
      action: 'DELIVERY_BOY_UPDATED',
      resourceType: 'User',
      resourceId: deliveryBoy._id,
      details: `Delivery boy ${deliveryBoy.name} updated`,
      req,
    });

    res.json({
      success: true,
      message: 'Delivery boy updated successfully',
      data: deliveryBoy,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete delivery boy
// @route   DELETE /api/delivery-boys/:id
const deleteDeliveryBoy = async (req, res, next) => {
  try {
    const deliveryBoy = await User.findOne({ _id: req.params.id, role: 'delivery' });
    if (!deliveryBoy) {
      return res.status(404).json({ success: false, message: 'Delivery boy not found' });
    }

    deliveryBoy.active = false;
    await deliveryBoy.save();

    logAudit({
      action: 'DELIVERY_BOY_DEACTIVATED',
      resourceType: 'User',
      resourceId: deliveryBoy._id,
      details: `Delivery boy ${deliveryBoy.name} deactivated`,
      req,
    });

    res.json({ success: true, message: 'Delivery boy deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDeliveryBoys, getDeliveryBoyById, createDeliveryBoy, updateDeliveryBoy, deleteDeliveryBoy };
