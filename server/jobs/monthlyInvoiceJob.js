const cron = require('node-cron');
const Customer = require('../models/Customer');
const Delivery = require('../models/Delivery');
const Invoice = require('../models/Invoice');
const Counter = require('../models/Counter');
const Settings = require('../models/Settings');
const { sendInvoiceEmail } = require('../services/emailService');
const { startOfMonth, endOfMonth, subMonths, format } = require('date-fns');

const generateMonthlyInvoices = async () => {
  console.log('📋 Starting monthly invoice generation...');

  try {
    const settings = await Settings.getSettings();
    const prevMonth = subMonths(new Date(), 1);
    const periodStart = startOfMonth(prevMonth);
    const periodEnd = endOfMonth(prevMonth);

    const periodLabel = format(prevMonth, 'MMMM yyyy');
    console.log(`   Billing period: ${periodLabel}`);

    // Get all active customers
    const customers = await Customer.find({ active: true });
    let generated = 0;
    let skipped = 0;
    let errors = 0;

    for (const customer of customers) {
      try {
        // Check if invoice already exists
        const existing = await Invoice.findOne({
          customer: customer._id,
          billingPeriodStart: periodStart,
          billingPeriodEnd: periodEnd,
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Fetch delivered records
        const deliveries = await Delivery.find({
          customer: customer._id,
          date: { $gte: periodStart, $lte: periodEnd },
          status: 'Delivered',
        }).sort('date');

        if (deliveries.length === 0 && !settings.enableZeroInvoice) {
          skipped++;
          continue;
        }

        // Build line items
        const lineItems = deliveries.map((d) => ({
          date: d.date,
          quantityMl: d.finalQuantityMl,
          ratePer: d.milkRate,
          amount: (d.finalQuantityMl / 1000) * d.milkRate,
        }));

        const totalQuantityMl = deliveries.reduce((sum, d) => sum + d.finalQuantityMl, 0);
        const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
        const effectiveRate = totalQuantityMl > 0 ? (subtotal / (totalQuantityMl / 1000)) : customer.milkRate;
        const grandTotal = Math.round(subtotal * 100) / 100;

        const invoiceNumber = await Counter.getNextInvoiceNumber(settings.invoicePrefix);

        const invoice = await Invoice.create({
          invoiceNumber,
          customer: customer._id,
          customerSnapshot: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
          },
          billingPeriodStart: periodStart,
          billingPeriodEnd: periodEnd,
          invoiceDate: new Date(),
          lineItems,
          totalQuantityMl,
          rate: effectiveRate,
          subtotal,
          adjustments: 0,
          grandTotal,
          remainingAmount: grandTotal,
          paymentStatus: 'Unpaid',
          emailStatus: customer.email ? 'Not Sent' : 'No Email',
        });

        generated++;

        // Auto-email if enabled
        if (settings.autoEmailInvoice && customer.email) {
          try {
            await sendInvoiceEmail(invoice, null);
            invoice.emailStatus = 'Sent';
            invoice.emailSentAt = new Date();
            await invoice.save();
          } catch (emailErr) {
            invoice.emailStatus = 'Failed';
            invoice.emailError = emailErr.message;
            await invoice.save();
            console.error(`   ❌ Email failed for ${customer.name}: ${emailErr.message}`);
          }
        }
      } catch (custErr) {
        errors++;
        console.error(`   ❌ Error processing ${customer.name}: ${custErr.message}`);
      }
    }

    console.log(`✅ Monthly invoices: ${generated} generated, ${skipped} skipped, ${errors} errors`);
  } catch (error) {
    console.error('❌ Monthly invoice job failed:', error.message);
  }
};

const startMonthlyInvoiceJob = () => {
  // Run at 00:05 on the 1st of every month
  cron.schedule('5 0 1 * *', () => {
    console.log('\n⏰ Monthly invoice cron triggered');
    generateMonthlyInvoices();
  });

  console.log('📅 Monthly invoice job scheduled (1st of each month at 00:05)');
};

module.exports = { startMonthlyInvoiceJob, generateMonthlyInvoices };
