const Customer = require('../models/Customer');
const mongoose = require('mongoose');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all customers
// @route   GET /api/customers
const getCustomers = async (req, res, next) => {
  try {
    const { search, status, deliveryBoy, staff, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    // Cap page limit to prevent large dumps
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedPage = Math.max(parseInt(page) || 1, 1);

    const query = {};

    if (search) {
      // Sanitized: escape regex special chars from user input
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (status === 'active') query.active = true;
    if (status === 'inactive') query.active = false;
    if (deliveryBoy && mongoose.Types.ObjectId.isValid(deliveryBoy)) {
      query.assignedDeliveryBoy = deliveryBoy;
    }
    if (staff && mongoose.Types.ObjectId.isValid(staff)) {
      query.assignedStaff = staff;
    }

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .populate('assignedStaff', 'name phone')
      .populate('assignedDeliveryBoy', 'name phone')
      .sort(sort)
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.json({
      success: true,
      data: customers,
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

// @desc    Get single customer
// @route   GET /api/customers/:id
const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedStaff', 'name phone email')
      .populate('assignedDeliveryBoy', 'name phone email');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Create customer
// @route   POST /api/customers
const createCustomer = async (req, res, next) => {
  try {
    // Explicit field whitelist — prevents mass assignment
    const {
      name, email, phone, address, googleMapsLink,
      dailyMilkQuantityMl, milkRate, assignedStaff,
      assignedDeliveryBoy, deliveryOrder, notes,
    } = req.body;

    const customer = await Customer.create({
      name,
      email: email || '',
      phone,
      address,
      googleMapsLink: googleMapsLink || '',
      dailyMilkQuantityMl,
      milkRate,
      assignedStaff: assignedStaff || null,
      assignedDeliveryBoy: assignedDeliveryBoy || null,
      deliveryOrder: deliveryOrder || 0,
      notes: notes || '',
    });

    const populated = await Customer.findById(customer._id)
      .populate('assignedStaff', 'name phone')
      .populate('assignedDeliveryBoy', 'name phone');

    logAudit({
      action: 'CUSTOMER_CREATED',
      resourceType: 'Customer',
      resourceId: customer._id,
      details: `Customer ${customer.name} created`,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
const updateCustomer = async (req, res, next) => {
  try {
    // Explicit field whitelist — prevents mass assignment
    const allowedFields = {};
    const {
      name, email, phone, address, googleMapsLink,
      dailyMilkQuantityMl, milkRate, assignedStaff,
      assignedDeliveryBoy, deliveryOrder, notes, active,
    } = req.body;

    if (name !== undefined) allowedFields.name = name;
    if (email !== undefined) allowedFields.email = email;
    if (phone !== undefined) allowedFields.phone = phone;
    if (address !== undefined) allowedFields.address = address;
    if (googleMapsLink !== undefined) allowedFields.googleMapsLink = googleMapsLink;
    if (dailyMilkQuantityMl !== undefined) allowedFields.dailyMilkQuantityMl = dailyMilkQuantityMl;
    if (milkRate !== undefined) allowedFields.milkRate = milkRate;
    if (assignedStaff !== undefined) allowedFields.assignedStaff = assignedStaff || null;
    if (assignedDeliveryBoy !== undefined) allowedFields.assignedDeliveryBoy = assignedDeliveryBoy || null;
    if (deliveryOrder !== undefined) allowedFields.deliveryOrder = deliveryOrder;
    if (notes !== undefined) allowedFields.notes = notes;
    if (active !== undefined) allowedFields.active = active;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      allowedFields,
      { new: true, runValidators: true }
    )
      .populate('assignedStaff', 'name phone')
      .populate('assignedDeliveryBoy', 'name phone');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    logAudit({
      action: 'CUSTOMER_UPDATED',
      resourceType: 'Customer',
      resourceId: customer._id,
      details: `Customer ${customer.name} updated`,
      req,
    });

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete customer
// @route   DELETE /api/customers/:id
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await Customer.findByIdAndDelete(req.params.id);

    logAudit({
      action: 'CUSTOMER_DELETED',
      resourceType: 'Customer',
      resourceId: customer._id,
      details: `Customer ${customer.name} permanently deleted`,
      req,
    });

    res.json({
      success: true,
      message: 'Customer permanently deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate or deactivate customer
// @route   PATCH /api/customers/:id/status
const toggleCustomerStatus = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const newActive = req.body.active !== undefined ? Boolean(req.body.active) : !customer.active;
    customer.active = newActive;
    await customer.save();

    logAudit({
      action: newActive ? 'CUSTOMER_ACTIVATED' : 'CUSTOMER_DEACTIVATED',
      resourceType: 'Customer',
      resourceId: customer._id,
      details: `Customer ${customer.name} marked as ${newActive ? 'Active' : 'Inactive'}`,
      req,
    });

    res.json({
      success: true,
      message: `Customer marked as ${newActive ? 'Active' : 'Inactive'}`,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery order for customers
// @route   PUT /api/customers/reorder
const reorderCustomers = async (req, res, next) => {
  try {
    const { orders } = req.body; // [{ customerId, deliveryOrder }]

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ success: false, message: 'Invalid order data' });
    }

    // Validate all IDs before executing
    const invalidIds = orders.filter((o) => !mongoose.Types.ObjectId.isValid(o.customerId));
    if (invalidIds.length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid customer IDs in order' });
    }

    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.customerId },
        // Only update deliveryOrder field — prevents tampering with other fields
        update: { $set: { deliveryOrder: parseInt(item.deliveryOrder) || 0 } },
      },
    }));

    await Customer.bulkWrite(bulkOps);

    logAudit({
      action: 'CUSTOMER_REORDERED',
      resourceType: 'Customer',
      details: `Reordered ${orders.length} customers`,
      req,
    });

    res.json({
      success: true,
      message: 'Delivery order updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  toggleCustomerStatus,
  reorderCustomers,
};
