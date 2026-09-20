const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      default: 'DAJIRAJ DAIRY & FARM',
    },
    tagline: {
      type: String,
      default: 'Milking with Care',
    },
    secondaryTagline: {
      type: String,
      default: 'Farming with Love',
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    googleMapsLink: {
      type: String,
      default: '',
    },
    businessHours: {
      type: String,
      default: '',
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },
    // Branding
    primaryColor: {
      type: String,
      default: '#2d6a2e',
    },
    secondaryColor: {
      type: String,
      default: '#d4a843',
    },
    // Billing
    defaultMilkRate: {
      type: Number,
      default: 60,
    },
    invoicePrefix: {
      type: String,
      default: 'DDF',
    },
    taxEnabled: {
      type: Boolean,
      default: false,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    taxLabel: {
      type: String,
      default: 'GST',
    },
    paymentTerms: {
      type: String,
      default: 'Due on receipt',
    },
    // Delivery
    deliveryAdjustmentMl: {
      type: Number,
      default: 250,
    },
    // SMTP
    smtpHost: {
      type: String,
      default: '',
    },
    smtpPort: {
      type: Number,
      default: 587,
    },
    smtpUser: {
      type: String,
      default: '',
    },
    smtpPass: {
      type: String,
      default: '',
      select: false,
    },
    smtpFromName: {
      type: String,
      default: 'Dajiraj Dairy & Farm',
    },
    smtpFromEmail: {
      type: String,
      default: '',
    },
    smtpSecure: {
      type: Boolean,
      default: false,
    },
    autoEmailInvoice: {
      type: Boolean,
      default: false,
    },
    enableZeroInvoice: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure singleton - only one settings document
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.statics.getSettingsWithSmtp = async function () {
  let settings = await this.findOne().select('+smtpPass');
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
