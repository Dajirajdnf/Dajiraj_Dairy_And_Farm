const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    googleMapsLink: {
      type: String,
      trim: true,
      default: '',
    },
    dailyMilkQuantityMl: {
      type: Number,
      required: [true, 'Daily milk quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    milkRate: {
      type: Number,
      required: [true, 'Milk rate is required'],
      min: [0, 'Rate cannot be negative'],
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deliveryOrder: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
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

// Indexes
customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ assignedDeliveryBoy: 1 });
customerSchema.index({ assignedStaff: 1 });
customerSchema.index({ active: 1 });
customerSchema.index({ deliveryOrder: 1 });

module.exports = mongoose.model('Customer', customerSchema);
