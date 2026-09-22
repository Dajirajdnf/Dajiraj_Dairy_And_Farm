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

// Send customer confirmation email immediately upon successful milk delivery
const sendDeliveryConfirmationEmail = async (delivery, customer, deliveryBoy) => {
  const customerEmail = customer?.email;
  if (!customerEmail) {
    return null;
  }

  const settings = await Settings.getSettingsWithSmtp();
  const transporter = await getTransporter();

  const deliveredQtyL = ((delivery.finalQuantityMl || 0) / 1000).toFixed(2);
  const deliveredQtyMl = delivery.finalQuantityMl || 0;
  const deliveryTime = delivery.deliveredAt
    ? new Date(delivery.deliveredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const deliveryDate = delivery.date
    ? new Date(delivery.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const mailOptions = {
    from: `"${settings.smtpFromName || settings.businessName}" <${settings.smtpFromEmail || settings.smtpUser}>`,
    to: customerEmail,
    subject: `Milk Delivered Successfully - ${settings.businessName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1e5c1f 0%, #2d6a2e 100%); color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">${settings.businessName}</h1>
          <p style="margin: 4px 0 0; color: #d4a843; font-size: 13px;">${settings.tagline || 'Pure • Fresh • Natural'}</p>
        </div>
        <div style="padding: 24px; color: #333; line-height: 1.6;">
          <h2 style="color: #2d6a2e; margin-top: 0; font-size: 18px;">Delivery Confirmation</h2>
          <p>Dear <strong>${customer.name || 'Valued Customer'}</strong>,</p>
          <p>Your fresh milk has been successfully delivered to your doorstep. Here are your delivery details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
            <tr style="background: #f8fdf8;">
              <td style="padding: 10px 12px; border: 1px solid #e8f5e9; font-weight: 600; width: 40%;">Delivery Date</td>
              <td style="padding: 10px 12px; border: 1px solid #e8f5e9;">${deliveryDate} at ${deliveryTime}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border: 1px solid #e8f5e9; font-weight: 600;">Delivered Quantity</td>
              <td style="padding: 10px 12px; border: 1px solid #e8f5e9; font-weight: bold; color: #1e5c1f;">
                ${deliveredQtyL} Litre(s) (${deliveredQtyMl} ml)
              </td>
            </tr>
            <tr style="background: #f8fdf8;">
              <td style="padding: 10px 12px; border: 1px solid #e8f5e9; font-weight: 600;">Delivery Status</td>
              <td style="padding: 10px 12px; border: 1px solid #e8f5e9; color: #2e7d32; font-weight: bold;">
                Delivered
              </td>
            </tr>
            ${
              deliveryBoy?.name
                ? `<tr>
                    <td style="padding: 10px 12px; border: 1px solid #e8f5e9; font-weight: 600;">Delivered By</td>
                    <td style="padding: 10px 12px; border: 1px solid #e8f5e9;">${deliveryBoy.name}</td>
                  </tr>`
                : ''
            }
            ${
              delivery.notes
                ? `<tr style="background: #f8fdf8;">
                    <td style="padding: 10px 12px; border: 1px solid #e8f5e9; font-weight: 600;">Notes</td>
                    <td style="padding: 10px 12px; border: 1px solid #e8f5e9; color: #666;">${delivery.notes}</td>
                  </tr>`
                : ''
            }
          </table>

          <div style="background: #fdfbf7; border-left: 4px solid #d4a843; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 12px; color: #666;">
              Please store your milk in refrigeration promptly. If you have questions or need to pause or change tomorrow's delivery, reach out to us at <strong>${settings.phone || ''}</strong>.
            </p>
          </div>

          <p style="margin-bottom: 4px;">Thank you for trusting ${settings.businessName}!</p>
          <p style="margin: 0; color: #888; font-size: 11px;">${settings.secondaryTagline || ''}</p>
        </div>
      </div>
    `,
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
};

// Send retail bill email
const sendRetailBillEmail = async (bill, pdfBuffer) => {
  const customerEmail = bill.customerEmail || bill.customer?.email;
  if (!customerEmail) {
    throw new Error('Customer does not have an email address');
  }

  const settings = await Settings.getSettingsWithSmtp();
  const transporter = await getTransporter();

  const mailOptions = {
    from: `"${settings.smtpFromName || settings.businessName}" <${settings.smtpFromEmail || settings.smtpUser}>`,
    to: customerEmail,
    subject: `Retail Bill ${bill.billNumber} - ${settings.businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: #2d6a2e; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">${settings.businessName}</h1>
          <p style="margin: 5px 0; color: #d4a843;">${settings.tagline}</p>
        </div>
        <div style="padding: 20px; color: #333;">
          <p>Dear <strong>${bill.customerName || 'Customer'}</strong>,</p>
          <p>Thank you for your purchase at ${settings.businessName}. Please find attached your retail bill.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px;">
            <tr style="background: #f5f5f5;">
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Bill Number</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${bill.billNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment Method</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${bill.paymentMethod || 'Cash'}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Grand Total</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #2d6a2e;">₹${(bill.grandTotal || 0).toFixed(2)}</td>
            </tr>
          </table>
          <p>We appreciate your visit and look forward to serving you again!</p>
          <p style="color: #666; font-size: 12px;">${settings.tagline} • ${settings.phone || ''}</p>
        </div>
      </div>
    `,
    attachments: pdfBuffer
      ? [
          {
            filename: `${bill.billNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ]
      : [],
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
};

module.exports = {
  getTransporter,
  sendInvoiceEmail,
  sendDeliveryConfirmationEmail,
  sendRetailBillEmail,
};
