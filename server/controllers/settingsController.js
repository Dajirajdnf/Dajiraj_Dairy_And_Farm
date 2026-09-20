const Settings = require('../models/Settings');
const nodemailer = require('nodemailer');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get settings
// @route   GET /api/settings
const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings
// @route   PUT /api/settings
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.getSettings();

    // Explicit field whitelist — prevents mass assignment
    const {
      businessName, tagline, secondaryTagline, phone, email,
      address, googleMapsLink, businessHours,
      socialLinks, primaryColor, secondaryColor,
      defaultMilkRate, invoicePrefix, taxEnabled, taxRate, taxLabel,
      paymentTerms, deliveryAdjustmentMl,
      smtpHost, smtpPort, smtpUser, smtpPass,
      smtpFromName, smtpFromEmail, smtpSecure,
      autoEmailInvoice, enableZeroInvoice,
    } = req.body;

    const allowedUpdates = {};
    if (businessName !== undefined) allowedUpdates.businessName = businessName;
    if (tagline !== undefined) allowedUpdates.tagline = tagline;
    if (secondaryTagline !== undefined) allowedUpdates.secondaryTagline = secondaryTagline;
    if (phone !== undefined) allowedUpdates.phone = phone;
    if (email !== undefined) allowedUpdates.email = email;
    if (address !== undefined) allowedUpdates.address = address;
    if (googleMapsLink !== undefined) allowedUpdates.googleMapsLink = googleMapsLink;
    if (businessHours !== undefined) allowedUpdates.businessHours = businessHours;
    if (socialLinks !== undefined) allowedUpdates.socialLinks = socialLinks;
    if (primaryColor !== undefined) allowedUpdates.primaryColor = primaryColor;
    if (secondaryColor !== undefined) allowedUpdates.secondaryColor = secondaryColor;
    if (defaultMilkRate !== undefined) allowedUpdates.defaultMilkRate = defaultMilkRate;
    if (invoicePrefix !== undefined) allowedUpdates.invoicePrefix = invoicePrefix;
    if (taxEnabled !== undefined) allowedUpdates.taxEnabled = taxEnabled;
    if (taxRate !== undefined) allowedUpdates.taxRate = taxRate;
    if (taxLabel !== undefined) allowedUpdates.taxLabel = taxLabel;
    if (paymentTerms !== undefined) allowedUpdates.paymentTerms = paymentTerms;
    if (deliveryAdjustmentMl !== undefined) allowedUpdates.deliveryAdjustmentMl = deliveryAdjustmentMl;
    if (smtpHost !== undefined) allowedUpdates.smtpHost = smtpHost;
    if (smtpPort !== undefined) allowedUpdates.smtpPort = smtpPort;
    if (smtpUser !== undefined) allowedUpdates.smtpUser = smtpUser;
    if (smtpFromName !== undefined) allowedUpdates.smtpFromName = smtpFromName;
    if (smtpFromEmail !== undefined) allowedUpdates.smtpFromEmail = smtpFromEmail;
    if (smtpSecure !== undefined) allowedUpdates.smtpSecure = smtpSecure;
    if (autoEmailInvoice !== undefined) allowedUpdates.autoEmailInvoice = autoEmailInvoice;
    if (enableZeroInvoice !== undefined) allowedUpdates.enableZeroInvoice = enableZeroInvoice;

    // Only update SMTP password if a real new value is provided (not placeholder)
    if (smtpPass && smtpPass !== '••••••••' && smtpPass.length > 0) {
      allowedUpdates.smtpPass = smtpPass;
    }

    Object.assign(settings, allowedUpdates);
    await settings.save();

    // Fetch without SMTP pass for response
    settings = await Settings.getSettings();

    logAudit({
      action: 'SETTINGS_UPDATED',
      resourceType: 'Settings',
      resourceId: settings._id,
      details: 'Business & system settings updated',
      req,
    });

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Test SMTP connection
// @route   POST /api/settings/test-smtp
const testSmtp = async (req, res, next) => {
  try {
    const settings = await Settings.getSettingsWithSmtp();

    if (!settings.smtpHost || !settings.smtpUser) {
      return res.status(400).json({
        success: false,
        message: 'SMTP settings are not configured. Please configure SMTP first.',
      });
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    await transporter.verify();

    res.json({
      success: true,
      message: 'SMTP connection test successful!',
    });
  } catch (error) {
    // Return safe error without exposing SMTP credentials
    res.status(400).json({
      success: false,
      message: 'SMTP connection failed. Please check your SMTP settings.',
    });
  }
};

// @desc    Get public settings (for public website)
// @route   GET /api/settings/public
const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    res.json({
      success: true,
      data: {
        businessName: settings.businessName,
        tagline: settings.tagline,
        secondaryTagline: settings.secondaryTagline,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        googleMapsLink: settings.googleMapsLink,
        businessHours: settings.businessHours,
        socialLinks: settings.socialLinks,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings, testSmtp, getPublicSettings };
