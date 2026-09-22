const StockTransaction = require('../models/StockTransaction');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all stock entries/transactions
// @route   GET /api/stock
const getStockList = async (req, res, next) => {
  try {
    const { product, type, search, page = 1, limit = 50 } = req.query;
    const parsedLimit = Math.min(parseInt(limit) || 50, 200);
    const parsedPage = Math.max(parseInt(page) || 1, 1);

    const query = {};

    if (product && mongoose.Types.ObjectId.isValid(product)) {
      query.product = product;
    }

    if (type && ['in', 'out', 'adjustment'].includes(type)) {
      query.type = type;
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { supplier: { $regex: escaped, $options: 'i' } },
        { reason: { $regex: escaped, $options: 'i' } },
        { notes: { $regex: escaped, $options: 'i' } },
      ];
    }

    const total = await StockTransaction.countDocuments(query);
    const stockEntries = await StockTransaction.find(query)
      .populate('product', 'name category unit currentStock sellingPrice purchasePrice')
      .populate('createdBy', 'name')
      .sort('-date -createdAt')
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.json({
      success: true,
      data: stockEntries,
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

// @desc    Get single stock entry
// @route   GET /api/stock/:id
const getStockById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid stock entry ID' });
    }

    const entry = await StockTransaction.findById(req.params.id)
      .populate('product', 'name category unit currentStock sellingPrice purchasePrice')
      .populate('createdBy', 'name');

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Stock entry not found' });
    }

    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new stock entry (add/inward stock)
// @route   POST /api/stock
const createStock = async (req, res, next) => {
  try {
    const {
      product: productId,
      quantity,
      type = 'in',
      purchasePrice,
      sellingPrice,
      supplier,
      date,
      notes,
      reason,
    } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Valid product is required' });
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Quantity must be greater than 0',
        errors: { quantity: 'Quantity must be greater than 0' },
      });
    }

    if (!['in', 'out', 'adjustment'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Stock type must be in, out, or adjustment',
        errors: { type: 'Stock type must be in, out, or adjustment' },
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previousStock = product.currentStock || 0;
    let newStock;

    if (type === 'in') {
      newStock = previousStock + qty;
    } else if (type === 'out') {
      newStock = previousStock - qty;
      if (newStock < 0) {
        return res.status(400).json({
          success: false,
          message: `Validation failed: Insufficient stock. Available stock is ${previousStock} ${product.unit}`,
          errors: { quantity: `Cannot deduct ${qty} ${product.unit}. Current stock is ${previousStock}` },
        });
      }
    } else if (type === 'adjustment') {
      newStock = qty;
    }

    // Update product stock and prices if supplied
    product.currentStock = newStock;
    if (purchasePrice !== undefined && parseFloat(purchasePrice) >= 0) {
      product.purchasePrice = parseFloat(purchasePrice);
    }
    if (sellingPrice !== undefined && parseFloat(sellingPrice) >= 0) {
      product.sellingPrice = parseFloat(sellingPrice);
    }
    await product.save();

    const stockEntry = await StockTransaction.create({
      product: product._id,
      type,
      quantity: qty,
      unit: product.unit,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : product.purchasePrice || 0,
      sellingPrice: sellingPrice ? parseFloat(sellingPrice) : product.sellingPrice || 0,
      supplier: supplier ? String(supplier).trim() : '',
      date: date ? new Date(date) : new Date(),
      notes: notes ? String(notes).trim() : '',
      previousStock,
      newStock,
      reason: reason ? String(reason).trim() : (notes ? String(notes).trim() : `${type.toUpperCase()} stock entry`),
      createdBy: req.user._id,
    });

    await stockEntry.populate('product', 'name category unit currentStock');

    logAudit({
      action: 'STOCK_CREATED',
      resourceType: 'StockTransaction',
      resourceId: stockEntry._id,
      details: `Stock ${type} for ${product.name}: qty ${qty}, new stock ${newStock}`,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Stock entry created successfully',
      data: stockEntry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update stock entry
// @route   PUT /api/stock/:id
const updateStock = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid stock ID' });
    }

    const stockEntry = await StockTransaction.findById(req.params.id);
    if (!stockEntry) {
      return res.status(404).json({ success: false, message: 'Stock entry not found' });
    }

    const { quantity, purchasePrice, sellingPrice, supplier, date, notes, reason } = req.body;

    const product = await Product.findById(stockEntry.product);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Associated product not found' });
    }

    if (quantity !== undefined) {
      const newQty = parseFloat(quantity);
      if (isNaN(newQty) || newQty <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed: Quantity must be greater than 0',
          errors: { quantity: 'Quantity must be greater than 0' },
        });
      }

      // Recompute effect on product currentStock
      const oldQty = stockEntry.quantity;
      const type = stockEntry.type;
      let stockDelta = 0;

      if (type === 'in') {
        stockDelta = newQty - oldQty;
      } else if (type === 'out') {
        stockDelta = oldQty - newQty;
      }

      if (product.currentStock + stockDelta < 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed: Updating quantity would cause negative product stock',
          errors: { quantity: 'Updating quantity would result in negative stock' },
        });
      }

      product.currentStock += stockDelta;
      await product.save();

      stockEntry.quantity = newQty;
      stockEntry.newStock = stockEntry.previousStock + (type === 'in' ? newQty : -newQty);
    }

    if (purchasePrice !== undefined) {
      const pPrice = parseFloat(purchasePrice);
      if (pPrice < 0) return res.status(400).json({ success: false, message: 'Price cannot be negative' });
      stockEntry.purchasePrice = pPrice;
    }

    if (sellingPrice !== undefined) {
      const sPrice = parseFloat(sellingPrice);
      if (sPrice < 0) return res.status(400).json({ success: false, message: 'Price cannot be negative' });
      stockEntry.sellingPrice = sPrice;
    }

    if (supplier !== undefined) stockEntry.supplier = String(supplier).trim();
    if (date !== undefined) stockEntry.date = new Date(date);
    if (notes !== undefined) stockEntry.notes = String(notes).trim();
    if (reason !== undefined) stockEntry.reason = String(reason).trim();

    await stockEntry.save();
    await stockEntry.populate('product', 'name category unit currentStock');

    logAudit({
      action: 'STOCK_UPDATED',
      resourceType: 'StockTransaction',
      resourceId: stockEntry._id,
      details: `Stock entry ${stockEntry._id} updated for ${product.name}`,
      req,
    });

    res.json({
      success: true,
      message: 'Stock entry updated successfully',
      data: stockEntry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete stock entry (reverses stock effect safely)
// @route   DELETE /api/stock/:id
const deleteStock = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid stock ID' });
    }

    const stockEntry = await StockTransaction.findById(req.params.id);
    if (!stockEntry) {
      return res.status(404).json({ success: false, message: 'Stock entry not found' });
    }

    const product = await Product.findById(stockEntry.product);
    if (product) {
      // Reverse transaction effect on product stock
      let reversalDelta = 0;
      if (stockEntry.type === 'in') {
        reversalDelta = -stockEntry.quantity;
      } else if (stockEntry.type === 'out') {
        reversalDelta = stockEntry.quantity;
      }

      if (product.currentStock + reversalDelta < 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete stock entry: Reversing it would make product stock negative (Current: ${product.currentStock} ${product.unit})`,
        });
      }

      product.currentStock += reversalDelta;
      await product.save();
    }

    await StockTransaction.findByIdAndDelete(req.params.id);

    logAudit({
      action: 'STOCK_DELETED',
      resourceType: 'StockTransaction',
      resourceId: req.params.id,
      details: `Stock entry deleted and stock reversed for product ${product?.name || ''}`,
      req,
    });

    res.json({
      success: true,
      message: 'Stock entry deleted successfully and inventory updated',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStockList,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
};
