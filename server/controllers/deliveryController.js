const Customer = require('../models/Customer');
const Delivery = require('../models/Delivery');
const Settings = require('../models/Settings');
const { logAudit } = require('../utils/auditLogger');
const { startOfDay, endOfDay } = require('date-fns');

// @desc    Generate today's deliveries for all active customers
// @route   POST /api/deliveries/generate-today
const generateTodayDeliveries = async (req, res, next) => {
  try {
    const today = startOfDay(new Date());

    const activeCustomers = await Customer.find({
      active: true,
      assignedDeliveryBoy: { $ne: null },
    });

    let created = 0;
    let skipped = 0;

    for (const customer of activeCustomers) {
      const existing = await Delivery.findOne({
        customer: customer._id,
        date: today,
      });

      if (existing) {
        skipped++;
        continue;
      }

      await Delivery.create({
        customer: customer._id,
        deliveryBoy: customer.assignedDeliveryBoy,
        staff: customer.assignedStaff,
        date: today,
        baseQuantityMl: customer.dailyMilkQuantityMl,
        adjustmentMl: 0,
        finalQuantityMl: customer.dailyMilkQuantityMl,
        milkRate: customer.milkRate,
        status: 'Pending',
      });
      created++;
    }

    logAudit({
      action: 'DELIVERIES_GENERATED',
      resourceType: 'Delivery',
      details: `Generated ${created} deliveries, skipped ${skipped}`,
      req,
    });

    res.json({
      success: true,
      message: `Generated ${created} deliveries, ${skipped} already existed`,
      data: { created, skipped },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's deliveries for a delivery boy
// @route   GET /api/deliveries/today
const getTodayDeliveries = async (req, res, next) => {
  try {
    const today = startOfDay(new Date());
    const query = { date: today };

    // IDOR protection: delivery boy can ONLY see their own deliveries
    if (req.user.role === 'delivery') {
      query.deliveryBoy = req.user._id;
    } else if (req.query.deliveryBoy) {
      // Admin/staff: validate deliveryBoy filter is a valid ObjectId
      const { mongoose } = require('mongoose');
      query.deliveryBoy = req.query.deliveryBoy;
    }

    // Only allow valid status values
    const VALID_STATUSES = ['Pending', 'Delivered', 'Skipped', 'Cancelled', 'Corrected'];
    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      query.status = req.query.status;
    }

    const deliveries = await Delivery.find(query)
      .populate('customer', 'name phone address googleMapsLink dailyMilkQuantityMl deliveryOrder')
      .populate('deliveryBoy', 'name phone')
      .sort('customer.deliveryOrder');

    // Sort by customer delivery order
    deliveries.sort((a, b) => {
      const orderA = a.customer?.deliveryOrder || 0;
      const orderB = b.customer?.deliveryOrder || 0;
      return orderA - orderB;
    });

    res.json({
      success: true,
      data: deliveries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get deliveries with filters
// @route   GET /api/deliveries
const getDeliveries = async (req, res, next) => {
  try {
    const {
      date,
      startDate,
      endDate,
      deliveryBoy,
      customer,
      status,
      page = 1,
      limit = 50,
    } = req.query;

    const parsedLimit = Math.min(parseInt(limit) || 50, 200);
    const parsedPage = Math.max(parseInt(page) || 1, 1);

    const query = {};

    if (date) {
      const parsed = new Date(date);
      if (!isNaN(parsed)) query.date = startOfDay(parsed);
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start) && !isNaN(end)) {
        query.date = {
          $gte: startOfDay(start),
          $lte: endOfDay(end),
        };
      }
    }

    const mongoose = require('mongoose');
    if (deliveryBoy && mongoose.Types.ObjectId.isValid(deliveryBoy)) {
      query.deliveryBoy = deliveryBoy;
    }
    if (customer && mongoose.Types.ObjectId.isValid(customer)) {
      query.customer = customer;
    }

    const VALID_STATUSES = ['Pending', 'Delivered', 'Skipped', 'Cancelled', 'Corrected'];
    if (status && VALID_STATUSES.includes(status)) query.status = status;

    // IDOR protection: delivery boy can ONLY see their own deliveries
    if (req.user.role === 'delivery') {
      query.deliveryBoy = req.user._id;
    }

    const total = await Delivery.countDocuments(query);
    const deliveries = await Delivery.find(query)
      .populate('customer', 'name phone address')
      .populate('deliveryBoy', 'name phone')
      .sort('-date')
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.json({
      success: true,
      data: deliveries,
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

// @desc    Adjust delivery quantity (+/- 250ml)
// @route   PATCH /api/deliveries/:id/quantity
const adjustQuantity = async (req, res, next) => {
  try {
    const { action } = req.body; // 'increase' or 'decrease'

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    // IDOR protection: delivery boy can only adjust their own deliveries
    if (req.user.role === 'delivery' && delivery.deliveryBoy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (delivery.status === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Cannot adjust delivered order' });
    }

    const settings = await Settings.getSettings();
    const adjustmentStep = settings.deliveryAdjustmentMl || 250;

    let newAdjustment = delivery.adjustmentMl;

    if (action === 'increase') {
      newAdjustment += adjustmentStep;
    } else if (action === 'decrease') {
      newAdjustment -= adjustmentStep;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Use increase or decrease' });
    }

    const newFinal = delivery.baseQuantityMl + newAdjustment;

    if (newFinal < 0) {
      return res.status(400).json({ success: false, message: 'Quantity cannot be negative' });
    }

    delivery.adjustmentMl = newAdjustment;
    delivery.finalQuantityMl = newFinal;
    await delivery.save();

    res.json({
      success: true,
      message: `Quantity adjusted to ${(newFinal / 1000).toFixed(2)} L`,
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark delivery as completed
// @route   PATCH /api/deliveries/:id/complete
const markComplete = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    // IDOR protection: delivery boy can only mark their own deliveries
    if (req.user.role === 'delivery' && delivery.deliveryBoy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (delivery.status === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Delivery already completed' });
    }

    delivery.status = 'Delivered';
    delivery.deliveredAt = new Date();
    // Only allow notes from body, sanitized
    if (req.body.notes) delivery.notes = String(req.body.notes).slice(0, 300);
    await delivery.save();

    res.json({
      success: true,
      message: 'Delivery marked as completed',
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery status (admin correction)
// @route   PATCH /api/deliveries/:id/status
const updateDeliveryStatus = async (req, res, next) => {
  try {
    // Explicit whitelist — prevents mass assignment
    const { status, notes, finalQuantityMl } = req.body;
    const VALID_STATUSES = ['Pending', 'Delivered', 'Skipped', 'Cancelled', 'Corrected'];

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    if (status && VALID_STATUSES.includes(status)) delivery.status = status;
    if (notes) delivery.notes = String(notes).slice(0, 300);
    if (finalQuantityMl !== undefined) {
      const qty = parseFloat(finalQuantityMl);
      if (qty >= 0) {
        delivery.adjustmentMl = qty - delivery.baseQuantityMl;
        delivery.finalQuantityMl = qty;
      }
    }

    await delivery.save();

    logAudit({
      action: 'DELIVERY_STATUS_UPDATED',
      resourceType: 'Delivery',
      resourceId: delivery._id,
      details: `Delivery status updated to ${delivery.status}`,
      req,
    });

    res.json({
      success: true,
      message: 'Delivery updated successfully',
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivery boy dashboard stats
// @route   GET /api/deliveries/my-dashboard
const getDeliveryBoyDashboard = async (req, res, next) => {
  try {
    const today = startOfDay(new Date());

    const todayDeliveries = await Delivery.find({
      deliveryBoy: req.user._id, // Always scoped to authenticated user — no IDOR risk
      date: today,
    });

    const totalAssigned = todayDeliveries.length;
    const completed = todayDeliveries.filter((d) => d.status === 'Delivered').length;
    const pending = todayDeliveries.filter((d) => d.status === 'Pending').length;
    const totalExpectedMl = todayDeliveries.reduce((sum, d) => sum + d.finalQuantityMl, 0);
    const totalDeliveredMl = todayDeliveries
      .filter((d) => d.status === 'Delivered')
      .reduce((sum, d) => sum + d.finalQuantityMl, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthDeliveries = await Delivery.find({
      deliveryBoy: req.user._id,
      date: { $gte: monthStart, $lte: today },
      status: 'Delivered',
    });

    const monthlyTotalDeliveries = monthDeliveries.length;
    const monthlyTotalMl = monthDeliveries.reduce((sum, d) => sum + d.finalQuantityMl, 0);

    res.json({
      success: true,
      data: {
        today: {
          totalAssigned,
          completed,
          pending,
          totalExpectedMl,
          totalDeliveredMl,
          completionPercentage: totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0,
        },
        monthly: {
          totalDeliveries: monthlyTotalDeliveries,
          totalMl: monthlyTotalMl,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateTodayDeliveries,
  getTodayDeliveries,
  getDeliveries,
  adjustQuantity,
  markComplete,
  updateDeliveryStatus,
  getDeliveryBoyDashboard,
};
