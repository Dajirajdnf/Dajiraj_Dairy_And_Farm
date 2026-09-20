const express = require('express');
const router = express.Router();
const config = require('../config/env');
const { generateMonthlyInvoices } = require('../jobs/monthlyInvoiceJob');
const Customer = require('../models/Customer');
const Delivery = require('../models/Delivery');
const { startOfDay } = require('date-fns');
const { logAudit } = require('../utils/auditLogger');

// Middleware to verify Vercel Cron or webhook authorization
const verifyCronSecret = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const cronHeader = req.headers['x-cron-secret'];

  // If CRON_SECRET is configured, enforce it strictly
  if (config.cronSecret) {
    const expected = `Bearer ${config.cronSecret}`;
    if (authHeader === expected || cronHeader === config.cronSecret) {
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid cron secret',
    });
  }

  // If not configured in development, allow with warning
  if (config.nodeEnv !== 'production') {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Cron secret is not configured on server',
  });
};

router.use(verifyCronSecret);

// @desc    Generate monthly invoices for previous month
// @route   POST /api/cron/monthly-invoices
router.all('/monthly-invoices', async (req, res, next) => {
  try {
    const result = await generateMonthlyInvoices();
    logAudit({
      action: 'CRON_MONTHLY_INVOICES',
      resourceType: 'Invoice',
      details: 'Triggered via cron endpoint',
      req,
    });
    res.json({
      success: true,
      message: 'Monthly invoice generation triggered',
      result,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Generate daily deliveries for today
// @route   POST /api/cron/daily-deliveries
router.all('/daily-deliveries', async (req, res, next) => {
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
      action: 'CRON_DAILY_DELIVERIES',
      resourceType: 'Delivery',
      details: `Generated ${created} deliveries, skipped ${skipped} via cron`,
      req,
    });

    res.json({
      success: true,
      message: `Daily deliveries generated: ${created} created, ${skipped} skipped`,
      data: { created, skipped },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
