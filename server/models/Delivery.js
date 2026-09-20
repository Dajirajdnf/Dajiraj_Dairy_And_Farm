const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    deliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Delivery boy is required'],
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    date: {
      type: Date,
      required: [true, 'Delivery date is required'],
    },
    baseQuantityMl: {
      type: Number,
      required: [true, 'Base quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    adjustmentMl: {
      type: Number,
      default: 0,
    },
    finalQuantityMl: {
      type: Number,
      required: [true, 'Final quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    adjustmentReason: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Delivered', 'Skipped', 'Cancelled', 'Corrected'],
      default: 'Pending',
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    milkRate: {
      type: Number,
      required: [true, 'Milk rate is required'],
      min: [0, 'Rate cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate deliveries for same customer on same date
deliverySchema.index({ customer: 1, date: 1 }, { unique: true });
deliverySchema.index({ date: 1 });
deliverySchema.index({ deliveryBoy: 1 });
deliverySchema.index({ status: 1 });
deliverySchema.index({ deliveryBoy: 1, date: 1 });

module.exports = mongoose.model('Delivery', deliverySchema);
