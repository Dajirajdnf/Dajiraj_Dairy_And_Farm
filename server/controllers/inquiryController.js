const Inquiry = require('../models/Inquiry');
const mongoose = require('mongoose');
const { logAudit } = require('../utils/auditLogger');

const VALID_STATUSES = ['new', 'contacted', 'converted', 'closed', 'read', 'resolved'];

// @desc    Get all inquiries
// @route   GET /api/inquiries
const getInquiries = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedPage = Math.max(parseInt(page) || 1, 1);

    const query = {};

    if (status && VALID_STATUSES.includes(status)) query.status = status;

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    }

    const total = await Inquiry.countDocuments(query);
    const inquiries = await Inquiry.find(query)
      .sort('-createdAt')
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.json({
      success: true,
      data: inquiries,
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

// @desc    Create inquiry (public)
// @route   POST /api/inquiries
const createInquiry = async (req, res, next) => {
  try {
    // Explicit field whitelist — prevents mass assignment + XSS
    const { name, email, phone, subject, product, message } = req.body;

    const inquiry = await Inquiry.create({
      name,
      email: email || '',
      phone,
      subject: subject || '',
      product: product || '',
      message,
      status: 'new', // Always set server-side, never from request
    });

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted successfully. We will get back to you soon!',
      // Only return safe fields — not internal status/id
      data: {
        name: inquiry.name,
        phone: inquiry.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inquiry status
// @route   PATCH /api/inquiries/:id
const updateInquiry = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const updates = {};
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status value. Must be one of: ${VALID_STATUSES.join(', ')}`,
        });
      }
      updates.status = status;
    }

    if (notes !== undefined) {
      updates.notes = String(notes).slice(0, 1000);
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    logAudit({
      action: 'INQUIRY_STATUS_UPDATED',
      resourceType: 'Inquiry',
      resourceId: inquiry._id,
      details: `Inquiry status changed to ${inquiry.status}`,
      req,
    });

    res.json({
      success: true,
      message: `Inquiry marked as ${inquiry.status}`,
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
const deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    logAudit({
      action: 'INQUIRY_DELETED',
      resourceType: 'Inquiry',
      resourceId: inquiry._id,
      details: `Inquiry from ${inquiry.name} deleted`,
      req,
    });

    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInquiries, createInquiry, updateInquiry, deleteInquiry };
