const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  year: {
    type: Number,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

// Atomically increment and return the next invoice number
counterSchema.statics.getNextInvoiceNumber = async function (prefix = 'DDF') {
  const currentYear = new Date().getFullYear();
  const counter = await this.findOneAndUpdate(
    { name: 'invoice', year: currentYear },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const paddedSeq = String(counter.seq).padStart(6, '0');
  return `${prefix}-${currentYear}-${paddedSeq}`;
};

// Atomically increment and return the next retail bill number
counterSchema.statics.getNextRetailBillNumber = async function (prefix = 'DDF') {
  const currentYear = new Date().getFullYear();
  const counter = await this.findOneAndUpdate(
    { name: 'retail_bill', year: currentYear },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const paddedSeq = String(counter.seq).padStart(6, '0');
  return `${prefix}-RET-${currentYear}-${paddedSeq}`;
};

module.exports = mongoose.model('Counter', counterSchema);

