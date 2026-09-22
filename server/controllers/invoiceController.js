const Invoice = require('../models/Invoice');
const Delivery = require('../models/Delivery');
const Customer = require('../models/Customer');
const Counter = require('../models/Counter');
const Settings = require('../models/Settings');
const { logAudit } = require('../utils/auditLogger');
const { sendInvoiceEmail: sendEmail } = require('../services/emailService');
const { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, format } = require('date-fns');
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

  // Standard local/server launch
  return await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
};

// Helper: render invoice HTML
const renderInvoiceHtml = async (invoice, business) => {
  const templatePath = path.join(__dirname, '..', 'templates', 'invoice.ejs');
  const logoDataUri = getLogoDataUri();
  return await ejs.renderFile(templatePath, { invoice, business, logoDataUri });
};

// Helper: render invoice HTML → PDF Buffer
const generateInvoicePdfBuffer = async (invoice, business) => {
  const html = await renderInvoiceHtml(invoice, business);
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

// @desc    Get all invoices
// @route   GET /api/invoices
const getInvoices = async (req, res, next) => {
  try {
    const { customer, status, startDate, endDate, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (customer) query.customer = customer;
    if (status) query.paymentStatus = status;

    if (startDate && endDate) {
      query.invoiceDate = {
        $gte: startOfDay(new Date(startDate)),
        $lte: endOfDay(new Date(endDate)),
      };
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customerSnapshot.name': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('customer', 'name phone email')
      .sort('-invoiceDate')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name phone email address');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const settings = await Settings.getSettings();

    res.json({
      success: true,
      data: invoice,
      businessInfo: {
        businessName: settings.businessName,
        tagline: settings.tagline,
        secondaryTagline: settings.secondaryTagline,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate monthly invoice for a customer
// @route   POST /api/invoices/generate
const generateInvoice = async (req, res, next) => {
  try {
    const { customerId, billingMonth, billingYear, startDate, endDate } = req.body;

    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Customer ID is required' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    let periodStart, periodEnd;

    if (startDate && endDate) {
      periodStart = startOfDay(new Date(startDate));
      periodEnd = endOfDay(new Date(endDate));
    } else if (billingMonth !== undefined && billingYear) {
      periodStart = startOfMonth(new Date(billingYear, billingMonth));
      periodEnd = endOfMonth(new Date(billingYear, billingMonth));
    } else {
      // Default: previous month
      const prevMonth = subMonths(new Date(), 1);
      periodStart = startOfMonth(prevMonth);
      periodEnd = endOfMonth(prevMonth);
    }

    // Check for existing invoice
    const existingInvoice = await Invoice.findOne({
      customer: customerId,
      billingPeriodStart: periodStart,
      billingPeriodEnd: periodEnd,
    });

    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: `Invoice already exists for this period: ${existingInvoice.invoiceNumber}`,
      });
    }

    // Fetch delivered records for the period
    const deliveries = await Delivery.find({
      customer: customerId,
      date: { $gte: periodStart, $lte: periodEnd },
      status: 'Delivered',
    }).sort('date');

    if (deliveries.length === 0) {
      const settings = await Settings.getSettings();
      if (!settings.enableZeroInvoice) {
        return res.status(400).json({
          success: false,
          message: 'No deliveries found for this billing period',
        });
      }
    }

    // Build line items and calculate totals
    const lineItems = deliveries.map((d) => ({
      date: d.date,
      quantityMl: d.finalQuantityMl,
      ratePer: d.milkRate,
      amount: (d.finalQuantityMl / 1000) * d.milkRate,
    }));

    const totalQuantityMl = deliveries.reduce((sum, d) => sum + d.finalQuantityMl, 0);

    // Use weighted average rate if rates differ, otherwise use the rate
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const effectiveRate = totalQuantityMl > 0 ? (subtotal / (totalQuantityMl / 1000)) : customer.milkRate;

    const settings = await Settings.getSettings();
    const invoiceNumber = await Counter.getNextInvoiceNumber(settings.invoicePrefix);

    const grandTotal = Math.round(subtotal * 100) / 100;

    const invoice = await Invoice.create({
      invoiceNumber,
      customer: customer._id,
      customerSnapshot: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
      billingPeriodStart: periodStart,
      billingPeriodEnd: periodEnd,
      invoiceDate: new Date(),
      lineItems,
      totalQuantityMl,
      rate: effectiveRate,
      subtotal,
      adjustments: 0,
      grandTotal,
      remainingAmount: grandTotal,
      paymentStatus: 'Unpaid',
      emailStatus: customer.email ? 'Not Sent' : 'No Email',
    });

    logAudit({
      action: 'INVOICE_GENERATED',
      resourceType: 'Invoice',
      resourceId: invoice._id,
      details: `Invoice ${invoice.invoiceNumber} generated for ${invoice.customerSnapshot?.name || 'customer'} (Total: ₹${invoice.grandTotal})`,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status
// @route   PATCH /api/invoices/:id/payment
const updatePayment = async (req, res, next) => {
  try {
    const { paidAmount, paymentMethod, paymentNotes, paymentStatus } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (paymentStatus === 'Void') {
      invoice.paymentStatus = 'Void';
      invoice.paidAmount = 0;
      invoice.remainingAmount = 0;
      await invoice.save();

      logAudit({
        action: 'INVOICE_VOIDED',
        resourceType: 'Invoice',
        resourceId: invoice._id,
        details: `Invoice ${invoice.invoiceNumber} voided`,
        req,
      });

      return res.json({ success: true, message: 'Invoice voided', data: invoice });
    }

    if (paidAmount !== undefined) {
      invoice.paidAmount = paidAmount;
      invoice.remainingAmount = invoice.grandTotal - paidAmount;
      invoice.paymentDate = new Date();
      invoice.paymentMethod = paymentMethod || '';
      invoice.paymentNotes = paymentNotes || '';

      if (paidAmount >= invoice.grandTotal) {
        invoice.paymentStatus = 'Paid';
        invoice.remainingAmount = 0;
      } else if (paidAmount > 0) {
        invoice.paymentStatus = 'Partially Paid';
      } else {
        invoice.paymentStatus = 'Unpaid';
      }
    }

    if (paymentStatus && paymentStatus !== 'Void') {
      invoice.paymentStatus = paymentStatus;
    }

    await invoice.save();

    logAudit({
      action: 'INVOICE_PAYMENT_UPDATED',
      resourceType: 'Invoice',
      resourceId: invoice._id,
      details: `Payment updated for invoice ${invoice.invoiceNumber}: Status ${invoice.paymentStatus}, Paid ₹${invoice.paidAmount}`,
      req,
    });

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download invoice PDF
// @route   GET /api/invoices/:id/pdf
const getInvoicePdf = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name phone email address');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
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

    let pdfBuffer;
    try {
      pdfBuffer = await generateInvoicePdfBuffer(invoice, business);
    } catch (pdfErr) {
      console.error('PDF generation error:', pdfErr.message);
      return res.status(500).json({
        success: false,
        message: 'PDF generation failed on server. You can view or print the HTML invoice directly.',
        htmlUrl: `/api/invoices/${req.params.id}/html`,
      });
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Get rendered invoice HTML for print / browser view
// @route   GET /api/invoices/:id/html
const getInvoiceHtml = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name phone email address');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
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

    const html = await renderInvoiceHtml(invoice, business);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    next(error);
  }
};

// @desc    Send invoice via email
// @route   POST /api/invoices/:id/email
const sendInvoiceEmail = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name phone email address');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const customerEmail = invoice.customerSnapshot?.email || invoice.customer?.email;
    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Customer does not have an email address',
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

    let pdfBuffer;
    try {
      pdfBuffer = await generateInvoicePdfBuffer(invoice, business);
    } catch (pdfErr) {
      console.error('PDF generation failed, sending email without attachment:', pdfErr.message);
      pdfBuffer = null;
    }

    await sendEmail(invoice, pdfBuffer);

    invoice.emailStatus = 'Sent';
    invoice.emailSentAt = new Date();
    invoice.emailError = undefined;
    await invoice.save();

    logAudit({
      action: 'INVOICE_EMAILED',
      resourceType: 'Invoice',
      resourceId: invoice._id,
      details: `Invoice ${invoice.invoiceNumber} emailed to ${customerEmail}`,
      req,
    });

    res.json({
      success: true,
      message: `Invoice emailed successfully to ${customerEmail}`,
      data: { emailStatus: invoice.emailStatus, emailSentAt: invoice.emailSentAt },
    });
  } catch (error) {
    // Try to update invoice emailStatus to Failed
    try {
      await Invoice.findByIdAndUpdate(req.params.id, {
        emailStatus: 'Failed',
        emailError: error.message,
      });
    } catch (_) {}

    res.status(500).json({
      success: false,
      message: `Failed to send email: ${error.message}`,
    });
  }
};

module.exports = {
  getInvoices,
  getInvoice,
  generateInvoice,
  updatePayment,
  getInvoicePdf,
  getInvoiceHtml,
  sendInvoiceEmail,
};
