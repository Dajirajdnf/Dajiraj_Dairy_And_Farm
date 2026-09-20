const Customer = require('../models/Customer');
const Delivery = require('../models/Delivery');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Inquiry = require('../models/Inquiry');
const User = require('../models/User');
const { startOfDay, endOfDay, startOfMonth, endOfMonth } = require('date-fns');

// @desc    Get admin dashboard data
// @route   GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const today = startOfDay(new Date());
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    // Customer stats
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ active: true });

    // Today's delivery stats
    const todayDeliveries = await Delivery.find({ date: today });
    const todayExpectedMl = todayDeliveries.reduce((sum, d) => sum + d.finalQuantityMl, 0);
    const todayDeliveredMl = todayDeliveries
      .filter((d) => d.status === 'Delivered')
      .reduce((sum, d) => sum + d.finalQuantityMl, 0);
    const pendingDeliveries = todayDeliveries.filter((d) => d.status === 'Pending').length;
    const completedDeliveries = todayDeliveries.filter((d) => d.status === 'Delivered').length;

    // Product stats
    const totalProducts = await Product.countDocuments({ active: true });
    const lowStockProducts = await Product.countDocuments({
      active: true,
      $expr: { $lte: ['$currentStock', '$minimumStock'] },
    });

    // Revenue - current month invoices
    const monthInvoices = await Invoice.find({
      invoiceDate: { $gte: monthStart, $lte: monthEnd },
      paymentStatus: { $ne: 'Void' },
    });
    const currentMonthRevenue = monthInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const pendingInvoiceAmount = monthInvoices
      .filter((inv) => inv.paymentStatus !== 'Paid')
      .reduce((sum, inv) => sum + inv.remainingAmount, 0);

    // New inquiries
    const newInquiries = await Inquiry.countDocuments({ status: 'new' });

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        todayExpectedMl,
        todayDeliveredMl,
        pendingDeliveries,
        completedDeliveries,
        totalProducts,
        lowStockProducts,
        currentMonthRevenue,
        pendingInvoiceAmount,
        newInquiries,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard chart data
// @route   GET /api/dashboard/charts
const getDashboardCharts = async (req, res, next) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Daily milk delivery for last 30 days
    const dailyDeliveries = await Delivery.aggregate([
      {
        $match: {
          date: { $gte: startOfDay(thirtyDaysAgo), $lte: endOfDay(today) },
          status: 'Delivered',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalMl: { $sum: '$finalQuantityMl' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Monthly revenue for last 6 months
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Invoice.aggregate([
      {
        $match: {
          invoiceDate: { $gte: sixMonthsAgo },
          paymentStatus: { $ne: 'Void' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$invoiceDate' } },
          revenue: { $sum: '$grandTotal' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Delivery status distribution for today
    const todayStatus = await Delivery.aggregate([
      { $match: { date: startOfDay(today) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        dailyDeliveries,
        monthlyRevenue,
        todayStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getDashboardCharts };
