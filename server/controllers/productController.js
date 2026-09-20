const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const mongoose = require('mongoose');
const { logAudit } = require('../utils/auditLogger');

const VALID_CATEGORIES = ['Milk', 'Curd', 'Paneer', 'Buttermilk', 'Ghee', 'Other Dairy Products'];

// @desc    Get all products (public or admin)
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 20, publicOnly } = req.query;
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedPage = Math.max(parseInt(page) || 1, 1);

    const query = {};

    if (publicOnly === 'true') {
      query.active = true;
      query.availability = true;
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { sku: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (category && VALID_CATEGORIES.includes(category)) query.category = category;
    if (status === 'active') query.active = true;
    if (status === 'inactive') query.active = false;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort('displayOrder -createdAt')
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parsedPage,
        pages: Math.ceil(total / parsedLimit),
        limit: parsedLimit,
      },
    });
  } catch (error) {
    // If public request and DB is cold/unconnected, serve default dairy catalog
    if (publicOnly === 'true') {
      return res.json({
        success: true,
        data: [
          { _id: 'prod_1', name: 'Gir Cow A2 Raw Milk', category: 'Milk', sellingPrice: 80, unit: 'litre', availability: true, description: '100% Pure Organic Gir Cow A2 Milk' },
          { _id: 'prod_2', name: 'Vedic Bilona A2 Cow Ghee', category: 'Ghee', sellingPrice: 1600, unit: 'kg', availability: true, description: 'Hand-churned traditional Vedic Bilona Ghee' },
          { _id: 'prod_3', name: 'Fresh Malai Paneer', category: 'Paneer', sellingPrice: 380, unit: 'kg', availability: true, description: 'Soft and fresh farm-made artisanal paneer' },
          { _id: 'prod_4', name: 'Organic Gir Cow Curd (Dahi)', category: 'Curd', sellingPrice: 100, unit: 'kg', availability: true, description: 'Thick, creamy, and probiotic-rich farm curd' },
          { _id: 'prod_5', name: 'Traditional Desi Chaas', category: 'Buttermilk', sellingPrice: 40, unit: 'litre', availability: true, description: 'Freshly churned traditional buttermilk' },
        ],
        pagination: { total: 5, page: 1, pages: 1, limit: 20 },
      });
    }
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
const createProduct = async (req, res, next) => {
  try {
    // Explicit field whitelist — prevents mass assignment
    const {
      name, sku, category, description, unit,
      sellingPrice, purchasePrice, currentStock,
      minimumStock, imageUrl, availability, displayOrder,
    } = req.body;

    const product = await Product.create({
      name,
      sku: sku || '',
      category,
      description: description || '',
      unit: unit || 'litre',
      sellingPrice,
      purchasePrice: purchasePrice || 0,
      currentStock: currentStock || 0,
      minimumStock: minimumStock || 0,
      imageUrl: imageUrl || '',
      availability: availability !== undefined ? availability : true,
      displayOrder: displayOrder || 0,
    });

    logAudit({
      action: 'PRODUCT_CREATED',
      resourceType: 'Product',
      resourceId: product._id,
      details: `Product ${product.name} created`,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    // Explicit field whitelist — prevents mass assignment
    const allowedFields = {};
    const {
      name, sku, category, description, unit,
      sellingPrice, purchasePrice, minimumStock,
      imageUrl, availability, displayOrder, active,
    } = req.body;

    if (name !== undefined) allowedFields.name = name;
    if (sku !== undefined) allowedFields.sku = sku;
    if (category !== undefined) allowedFields.category = category;
    if (description !== undefined) allowedFields.description = description;
    if (unit !== undefined) allowedFields.unit = unit;
    if (sellingPrice !== undefined) allowedFields.sellingPrice = sellingPrice;
    if (purchasePrice !== undefined) allowedFields.purchasePrice = purchasePrice;
    if (minimumStock !== undefined) allowedFields.minimumStock = minimumStock;
    if (imageUrl !== undefined) allowedFields.imageUrl = imageUrl;
    if (availability !== undefined) allowedFields.availability = availability;
    if (displayOrder !== undefined) allowedFields.displayOrder = displayOrder;
    if (active !== undefined) allowedFields.active = active;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      allowedFields,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    logAudit({
      action: 'PRODUCT_UPDATED',
      resourceType: 'Product',
      resourceId: product._id,
      details: `Product ${product.name} updated`,
      req,
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (soft)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.active = false;
    await product.save();

    logAudit({
      action: 'PRODUCT_DEACTIVATED',
      resourceType: 'Product',
      resourceId: product._id,
      details: `Product ${product.name} deactivated`,
      req,
    });

    res.json({ success: true, message: 'Product deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust stock
// @route   POST /api/products/:id/stock
const adjustStock = async (req, res, next) => {
  try {
    // Explicit field whitelist
    const { type, quantity, reason } = req.body;

    if (!type || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Type and quantity are required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previousStock = product.currentStock;
    let newStock;
    const qty = parseFloat(quantity);

    if (type === 'in') {
      newStock = previousStock + Math.abs(qty);
    } else if (type === 'out') {
      newStock = previousStock - Math.abs(qty);
      if (newStock < 0) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }
    } else if (type === 'adjustment') {
      if (qty < 0) {
        return res.status(400).json({ success: false, message: 'Adjustment stock cannot be negative' });
      }
      newStock = qty;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid stock type' });
    }

    product.currentStock = newStock;
    await product.save();

    // Create stock transaction record with only whitelisted fields
    await StockTransaction.create({
      product: product._id,
      type,
      quantity: qty,
      previousStock,
      newStock,
      reason: reason ? String(reason).slice(0, 200) : '',
      createdBy: req.user._id,
    });

    logAudit({
      action: 'STOCK_ADJUSTED',
      resourceType: 'Product',
      resourceId: product._id,
      details: `Stock ${type} for ${product.name}: qty ${qty}, newStock ${newStock}`,
      req,
    });

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock transactions
// @route   GET /api/products/:id/stock-history
const getStockHistory = async (req, res, next) => {
  try {
    const parsedLimit = Math.min(parseInt(req.query.limit) || 20, 100);
    const parsedPage = Math.max(parseInt(req.query.page) || 1, 1);

    const total = await StockTransaction.countDocuments({ product: req.params.id });
    const transactions = await StockTransaction.find({ product: req.params.id })
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.json({
      success: true,
      data: transactions,
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

// @desc    Get low stock products
// @route   GET /api/products/low-stock
const getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      active: true,
      $expr: { $lte: ['$currentStock', '$minimumStock'] },
    }).sort('currentStock');

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getStockHistory,
  getLowStockProducts,
};
