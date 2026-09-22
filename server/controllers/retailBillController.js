const RetailBill = require('../models/RetailBill');
const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const Counter = require('../models/Counter');
const Settings = require('../models/Settings');
const { logAudit } = require('../utils/auditLogger');
const { sendRetailBillEmail } = require('../services/emailService');
const { startOfDay, endOfDay } = require('date-fns');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

// Helper: read logo as base64 data URI
const getLogoDataUri = () => {
  const possiblePaths = [
    path.join(__dirname, '..', '..', 'assets', 'dajiraj_logo.png'),
    path.join(__dirname, '..', '..', 'client', 'public', 'assets', 'dajiraj_logo.png'),
    path.join(__dirname, '..', 'public', 'assets', 'dajiraj_logo.png'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const data = fs.readFileSync(p);
        return `data:image/png;base64,${data.toString('base64')}`;
      } catch (_) {}
    }
  }
  return null;
};

// Helper: get Puppeteer browser instance (serverless-aware)
const getBrowser = async () => {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    try {
      const chromium = require('@sparticuz/chromium-min');
      const puppeteerCore = require('puppeteer-core');
      return await puppeteerCore.launch({
        args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } catch (e) {
      console.warn('Serverless chromium failed, falling back to puppeteer:', e.message);
    }
  }

  return await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
};

// Helper: render retail bill HTML
const renderRetailBillHtml = async (bill, business) => {
  const templatePath = path.join(__dirname, '..', 'templates', 'retailBill.ejs');
  const logoDataUri = getLogoDataUri();
  return await ejs.renderFile(templatePath, { bill, business, logoDataUri });
};

// Helper: render retail bill HTML → PDF Buffer
const generateRetailBillPdfBuffer = async (bill, business) => {
  const html = await renderRetailBillHtml(bill, business);
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });
    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// @desc    Get all retail bills
// @route   GET /api/retail-bills
const getRetailBills = async (req, res, next) => {
  try {
    const { customer, customerType, paymentMethod, startDate, endDate, search, page = 1, limit = 30 } = req.query;
    const query = {};

    if (customer) query.customer = customer;
    if (customerType) query.customerType = customerType;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    if (startDate && endDate) {
      query.createdAt = {
        $gte: startOfDay(new Date(startDate)),
        $lte: endOfDay(new Date(endDate)),
      };
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { billNumber: { $regex: escaped, $options: 'i' } },
        { customerName: { $regex: escaped, $options: 'i' } },
        { customerPhone: { $regex: escaped, $options: 'i' } },
      ];
    }

    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 30));

    const total = await RetailBill.countDocuments(query);
    const bills = await RetailBill.find(query)
      .populate('customer', 'name phone email address')
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.json({
      success: true,
      data: bills,
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

// @desc    Get single retail bill by ID
// @route   GET /api/retail-bills/:id
const getRetailBillById = async (req, res, next) => {
  try {
    const bill = await RetailBill.findById(req.params.id)
      .populate('customer', 'name phone email address')
      .populate('createdBy', 'name');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Retail bill not found' });
    }

    res.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new retail bill
// @route   POST /api/retail-bills
const createRetailBill = async (req, res, next) => {
  try {
    const {
      customerType = 'walkin',
      customer = null,
      customerName = 'Walk-in Customer',
      customerPhone = '',
      customerEmail = '',
      items = [],
      discount = 0,
      taxRate = 0,
      paymentMethod = 'Cash',
      paidAmount,
      notes = '',
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A bill must have at least one product item',
        errors: { items: 'At least one line item is required' },
      });
    }

    // 1. Validate each product and verify stock availability
    const verifiedItems = [];
    for (const item of items) {
      const prodId = item.product?._id || item.product;
      const qty = parseFloat(item.quantity);
      if (!prodId || isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product or quantity in line items',
          errors: { items: 'Each item must have a valid product and positive quantity' },
        });
      }

      const product = await Product.findById(prodId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name || prodId}`,
        });
      }

      const availableStock = product.currentStock !== undefined ? product.currentStock : (product.stock || 0);
      if (availableStock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${availableStock} ${product.unit}, Requested: ${qty} ${product.unit}`,
          errors: { [product._id]: `Only ${availableStock} available in stock` },
        });
      }

      const price = item.price !== undefined ? parseFloat(item.price) : (product.sellingPrice ?? product.price ?? 0);
      const itemAmount = Math.round(qty * price * 100) / 100;

      verifiedItems.push({
        productDoc: product,
        itemData: {
          product: product._id,
          name: product.name,
          unit: product.unit || 'Liter',
          quantity: qty,
          price,
          amount: itemAmount,
        },
      });
    }

    // 2. Compute accurate financial calculations server-side
    const subtotal = verifiedItems.reduce((acc, it) => acc + it.itemData.amount, 0);
    const parsedDiscount = Math.max(0, parseFloat(discount) || 0);
    const parsedTaxRate = Math.max(0, parseFloat(taxRate) || 0);
    const taxableAmount = Math.max(0, subtotal - parsedDiscount);
    const taxAmount = Math.round(((taxableAmount * parsedTaxRate) / 100) * 100) / 100;
    const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

    const actualPaid = paidAmount !== undefined ? Math.max(0, parseFloat(paidAmount)) : grandTotal;
    const paymentStatus = actualPaid >= grandTotal ? 'Paid' : actualPaid > 0 ? 'Partial' : 'Pending';

    // 3. Atomically generate bill number
    const billNumber = await Counter.getNextRetailBillNumber();

    // 4. Deduct inventory & record StockTransaction (outward) for each item
    for (const { productDoc, itemData } of verifiedItems) {
      await Product.findByIdAndUpdate(productDoc._id, {
        $inc: {
          currentStock: -itemData.quantity,
          stock: -itemData.quantity,
        },
      });

      await StockTransaction.create({
        product: productDoc._id,
        type: 'out',
        quantity: itemData.quantity,
        unit: itemData.unit,
        sellingPrice: itemData.price,
        date: new Date(),
        reason: `Retail Bill: ${billNumber}`,
        notes: `Customer: ${customerName || 'Walk-in'}`,
        createdBy: req.user?._id || null,
      });
    }

    // 5. Create RetailBill document
    const newBill = await RetailBill.create({
      billNumber,
      customerType,
      customer: customer || null,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      items: verifiedItems.map((v) => v.itemData),
      subtotal,
      discount: parsedDiscount,
      taxRate: parsedTaxRate,
      taxAmount,
      grandTotal,
      paidAmount: actualPaid,
      paymentMethod,
      paymentStatus,
      notes: notes.trim(),
      createdBy: req.user?._id || null,
    });

    logAudit({
      action: 'RETAIL_BILL_CREATED',
      resourceType: 'RetailBill',
      resourceId: newBill._id,
      details: `Created Retail Bill ${billNumber} for ₹${grandTotal}`,
      req,
    });

    res.status(201).json({
      success: true,
      message: `Retail bill ${billNumber} generated successfully`,
      data: newBill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download retail bill as PDF
// @route   GET /api/retail-bills/:id/pdf
const getRetailBillPdf = async (req, res, next) => {
  try {
    const bill = await RetailBill.findById(req.params.id)
      .populate('customer', 'name phone email address');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Retail bill not found' });
    }

    const settings = await Settings.getSettings();
    const business = {
      businessName: settings.businessName || 'Dajiraj Dairy & Farm',
      tagline: settings.tagline || 'Pure • Fresh • Natural',
      secondaryTagline: settings.secondaryTagline || 'Authentic Desi Gir Cow A2 Milk & Dairy Products',
      phone: settings.phone || '+91 98765 43210',
      email: settings.email || 'care@dajirajdairy.com',
      address: settings.address || 'Dajiraj Dairy & Farm, Gujarat, India',
    };

    const pdfBuffer = await generateRetailBillPdfBuffer(bill, business);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${bill.billNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Send retail bill via email
// @route   POST /api/retail-bills/:id/email
const emailRetailBill = async (req, res, next) => {
  try {
    const bill = await RetailBill.findById(req.params.id)
      .populate('customer', 'name phone email address');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Retail bill not found' });
    }

    const targetEmail = bill.customerEmail || bill.customer?.email;
    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        message: 'No email address available for this bill/customer',
      });
    }

    const settings = await Settings.getSettings();
    const business = {
      businessName: settings.businessName,
      tagline: settings.tagline,
      secondaryTagline: settings.secondaryTagline,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
    };

    let pdfBuffer = null;
    try {
      pdfBuffer = await generateRetailBillPdfBuffer(bill, business);
    } catch (pdfErr) {
      console.error('Retail bill PDF generation error for email:', pdfErr.message);
    }

    await sendRetailBillEmail(bill, pdfBuffer);

    res.json({
      success: true,
      message: `Retail bill emailed successfully to ${targetEmail}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to send email: ${error.message}`,
    });
  }
};

module.exports = {
  getRetailBills,
  getRetailBillById,
  createRetailBill,
  getRetailBillPdf,
  emailRetailBill,
};
