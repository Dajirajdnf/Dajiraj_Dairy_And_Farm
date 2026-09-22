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
    // Explicit field whitelist — prevents mass assignment and supports aliases
    const {
      name, sku, category, description, unit,
      sellingPrice, price, purchasePrice,
      currentStock, stock, minimumStock, minStockAlert,
      imageUrl, availability, isPublic, displayOrder,
    } = req.body;

    const trimmedName = name.trim();

    // Check duplicate active product
    const existing = await Product.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      active: true,
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A product with this name already exists' });
    }

    const finalSellingPrice = sellingPrice !== undefined ? Number(sellingPrice) : Number(price);
    const finalCurrentStock = currentStock !== undefined ? Number(currentStock) : (stock !== undefined ? Number(stock) : 0);
    const finalMinStock = minimumStock !== undefined ? Number(minimumStock) : (minStockAlert !== undefined ? Number(minStockAlert) : 0);
    const finalAvailability = availability !== undefined ? Boolean(availability) : (isPublic !== undefined ? Boolean(isPublic) : true);

    const product = await Product.create({
      name: trimmedName,
      sku: sku || '',
      category,
      description: description || '',
      unit: unit || 'litre',
      sellingPrice: finalSellingPrice,
      purchasePrice: purchasePrice ? Number(purchasePrice) : 0,
      currentStock: finalCurrentStock,
      minimumStock: finalMinStock,
      imageUrl: imageUrl || '',
      availability: finalAvailability,
      displayOrder: displayOrder ? Number(displayOrder) : 0,
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
      sellingPrice, price, purchasePrice,
      minimumStock, minStockAlert, currentStock, stock,
      imageUrl, availability, isPublic, displayOrder, active, isActive,
    } = req.body;

    if (name !== undefined) {
      const trimmedName = name.trim();
      const existing = await Product.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        active: true,
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Another product with this name already exists' });
      }
      allowedFields.name = trimmedName;
    }

    if (sku !== undefined) allowedFields.sku = sku;
    if (category !== undefined) allowedFields.category = category;
    if (description !== undefined) allowedFields.description = description;
    if (unit !== undefined) allowedFields.unit = unit;
    if (sellingPrice !== undefined) allowedFields.sellingPrice = Number(sellingPrice);
    else if (price !== undefined) allowedFields.sellingPrice = Number(price);

    if (purchasePrice !== undefined) allowedFields.purchasePrice = Number(purchasePrice);

    if (minimumStock !== undefined) allowedFields.minimumStock = Number(minimumStock);
    else if (minStockAlert !== undefined) allowedFields.minimumStock = Number(minStockAlert);

    if (currentStock !== undefined) allowedFields.currentStock = Number(currentStock);
    else if (stock !== undefined) allowedFields.currentStock = Number(stock);

    if (imageUrl !== undefined) allowedFields.imageUrl = imageUrl;

    if (availability !== undefined) allowedFields.availability = Boolean(availability);
    else if (isPublic !== undefined) allowedFields.availability = Boolean(isPublic);

    if (displayOrder !== undefined) allowedFields.displayOrder = Number(displayOrder);

    if (active !== undefined) allowedFields.active = Boolean(active);
    else if (isActive !== undefined) allowedFields.active = Boolean(isActive);

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

// @desc    Permanently delete product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    logAudit({
      action: 'PRODUCT_DELETED',
      resourceType: 'Product',
      resourceId: product._id,
      details: `Product ${product.name} permanently deleted`,
      req,
    });

    res.json({ success: true, message: 'Product permanently deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product active status
// @route   PATCH /api/products/:id/status
const toggleProductStatus = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const newActive = req.body.active !== undefined ? Boolean(req.body.active) : !product.active;
    product.active = newActive;
    await product.save();

    logAudit({
      action: newActive ? 'PRODUCT_ACTIVATED' : 'PRODUCT_DEACTIVATED',
      resourceType: 'Product',
      resourceId: product._id,
      details: `Product ${product.name} marked as ${newActive ? 'Active' : 'Inactive'}`,
      req,
    });

    res.json({
      success: true,
      message: `Product marked as ${newActive ? 'Active' : 'Inactive'}`,
      data: product,
    });
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
  toggleProductStatus,
  adjustStock,
  getStockHistory,
  getLowStockProducts,
};
