const Delivery = require('../models/Delivery');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } = require('date-fns');

// @desc    Milk delivery report
// @route   GET /api/reports/milk
const getMilkReport = async (req, res, next) => {
  try {
    const { period = 'daily', date, startDate, endDate, deliveryBoy, customer } = req.query;

    let start, end;
    const now = new Date();

    if (startDate && endDate) {
      start = startOfDay(new Date(startDate));
      end = endOfDay(new Date(endDate));
    } else if (date) {
      start = startOfDay(new Date(date));
      end = endOfDay(new Date(date));
    } else if (period === 'daily') {
      start = startOfDay(now);
      end = endOfDay(now);
    } else if (period === 'weekly') {
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
    } else if (period === 'monthly') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    }

    const match = { date: { $gte: start, $lte: end } };
    if (deliveryBoy) match.deliveryBoy = require('mongoose').Types.ObjectId(deliveryBoy);
    if (customer) match.customer = require('mongoose').Types.ObjectId(customer);

    const report = await Delivery.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalBaseMl: { $sum: '$baseQuantityMl' },
          totalFinalMl: { $sum: '$finalQuantityMl' },
          totalDelivered: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
          totalPending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          totalSkipped: { $sum: { $cond: [{ $eq: ['$status', 'Skipped'] }, 1, 0] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

// @desc    Revenue report
// @route   GET /api/reports/revenue
const getRevenueReport = async (req, res, next) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    let start, end;
    const now = new Date();

    if (startDate && endDate) {
      start = startOfDay(new Date(startDate));
      end = endOfDay(new Date(endDate));
    } else {
      start = new Date(now.getFullYear(), 0, 1);
      end = endOfDay(now);
    }

    const groupFormat = period === 'daily' ? '%Y-%m-%d' : '%Y-%m';

    const report = await Invoice.aggregate([
      {
        $match: {
          invoiceDate: { $gte: start, $lte: end },
          paymentStatus: { $ne: 'Void' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$invoiceDate' } },
          totalRevenue: { $sum: '$grandTotal' },
          totalPaid: { $sum: '$paidAmount' },
          totalPending: { $sum: '$remainingAmount' },
          invoiceCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer report
// @route   GET /api/reports/customers
const getCustomerReport = async (req, res, next) => {
  try {
    const activeCustomers = await Customer.countDocuments({ active: true });
    const inactiveCustomers = await Customer.countDocuments({ active: false });

    const thisMonth = startOfMonth(new Date());
    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: thisMonth },
    });

    // Customer-wise milk quantity
    const customerMilk = await Customer.find({ active: true })
      .select('name phone dailyMilkQuantityMl milkRate')
      .sort('-dailyMilkQuantityMl');

    res.json({
      success: true,
      data: {
        activeCustomers,
        inactiveCustomers,
        newCustomers,
        customerMilk,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delivery report
// @route   GET /api/reports/delivery
const getDeliveryReport = async (req, res, next) => {
  try {
    const { startDate, endDate, deliveryBoy } = req.query;

    let start, end;
    if (startDate && endDate) {
      start = startOfDay(new Date(startDate));
      end = endOfDay(new Date(endDate));
    } else {
      start = startOfMonth(new Date());
      end = endOfMonth(new Date());
    }

    const match = { date: { $gte: start, $lte: end } };
    if (deliveryBoy) match.deliveryBoy = require('mongoose').Types.ObjectId(deliveryBoy);

    // By delivery boy
    const byDeliveryBoy = await Delivery.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$deliveryBoy',
          totalDeliveries: { $sum: 1 },
          totalDelivered: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
          totalMl: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, '$finalQuantityMl', 0] } },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'deliveryBoyInfo',
        },
      },
      { $unwind: '$deliveryBoyInfo' },
      {
        $project: {
          name: '$deliveryBoyInfo.name',
          totalDeliveries: 1,
          totalDelivered: 1,
          totalMl: 1,
        },
      },
    ]);

    // By status
    const byStatus = await Delivery.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: { byDeliveryBoy, byStatus },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stock report
// @route   GET /api/reports/stock
const getStockReport = async (req, res, next) => {
  try {
    const products = await Product.find({ active: true })
      .select('name category currentStock minimumStock unit')
      .sort('category name');

    const lowStock = products.filter((p) => p.currentStock <= p.minimumStock);

    // Recent stock movements
    const recentMovements = await StockTransaction.find()
      .populate('product', 'name')
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .limit(50);

    res.json({
      success: true,
      data: {
        products,
        lowStock,
        recentMovements,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMilkReport,
  getRevenueReport,
  getCustomerReport,
  getDeliveryReport,
  getStockReport,
};
