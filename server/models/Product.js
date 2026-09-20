const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Milk', 'Curd', 'Paneer', 'Buttermilk', 'Ghee', 'Other Dairy Products'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      default: 'litre',
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Price cannot be negative'],
    },
    purchasePrice: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    currentStock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    minimumStock: {
      type: Number,
      default: 0,
      min: [0, 'Minimum stock cannot be negative'],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    availability: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: check if low stock
productSchema.virtual('isLowStock').get(function () {
  return this.currentStock <= this.minimumStock;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Indexes
productSchema.index({ category: 1 });
productSchema.index({ active: 1 });
productSchema.index({ displayOrder: 1 });

module.exports = mongoose.model('Product', productSchema);
