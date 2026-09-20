const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');

const getTransporter = async () => {
  const settings = await Settings.getSettingsWithSmtp();

  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
    throw new Error('SMTP settings are not configured');
  }

  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpSecure,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass,
    },
  });
};

const sendInvoiceEmail = async (invoice, pdfBuffer) => {
  const settings = await Settings.getSettingsWithSmtp();
  const transporter = await getTransporter();

  const customerEmail = invoice.customerSnapshot?.email || invoice.customer?.email;

  if (!customerEmail) {
    throw new Error('Customer does not have an email address');
  }

  const mailOptions = {
    from: `"${settings.smtpFromName}" <${settings.smtpFromEmail || settings.smtpUser}>`,
    to: customerEmail,
    subject: `Invoice ${invoice.invoiceNumber} - ${settings.businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2d6a2e; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">${settings.businessName}</h1>
          <p style="margin: 5px 0; color: #d4a843;">${settings.tagline}</p>
        </div>
        <div style="padding: 20px;">
          <p>Dear <strong>${invoice.customerSnapshot?.name || 'Customer'}</strong>,</p>
          <p>Please find attached your milk delivery invoice for the billing period.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr style="background: #f5f5f5;">
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Invoice Number</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${invoice.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Quantity</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${(invoice.totalQuantityMl / 1000).toFixed(2)} L</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Grand Total</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #2d6a2e;">₹${invoice.grandTotal.toFixed(2)}</td>
            </tr>
          </table>
          <p>Thank you for choosing ${settings.businessName}!</p>
          <p style="color: #666; font-size: 12px;">${settings.tagline} • ${settings.secondaryTagline}</p>
        </div>
      </div>
    `,
    attachments: pdfBuffer
      ? [
          {
            filename: `${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ]
      : [],
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
};

module.exports = { getTransporter, sendInvoiceEmail };
