const mongoose = require('mongoose');

const invoiceLineItemSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    quantityMl: { type: Number, required: true },
    ratePer: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    // Snapshot of customer details at invoice time
    customerSnapshot: {
      name: String,
      email: String,
      phone: String,
      address: String,
    },
    billingPeriodStart: {
      type: Date,
      required: [true, 'Billing period start is required'],
    },
    billingPeriodEnd: {
      type: Date,
      required: [true, 'Billing period end is required'],
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    lineItems: [invoiceLineItemSchema],
    totalQuantityMl: {
      type: Number,
      required: true,
      default: 0,
    },
    rate: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    adjustments: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Void'],
      default: 'Unpaid',
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: '',
    },
    paymentNotes: {
      type: String,
      trim: true,
      default: '',
    },
    emailStatus: {
      type: String,
      enum: ['Not Sent', 'Sent', 'Failed', 'Pending', 'No Email'],
      default: 'Not Sent',
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
    emailError: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate invoices for same customer and billing period
invoiceSchema.index(
  { customer: 1, billingPeriodStart: 1, billingPeriodEnd: 1 },
  { unique: true }
);
invoiceSchema.index({ customer: 1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ invoiceDate: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
