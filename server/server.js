const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');
const { startMonthlyInvoiceJob } = require('./jobs/monthlyInvoiceJob');

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Start monthly invoice cron job
  startMonthlyInvoiceJob();

  // Start server
  app.listen(config.port, () => {
    console.log(`\n🥛 Dajiraj Dairy & Farm Server`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   API: http://localhost:${config.port}/api/health`);
    console.log(`   Client: ${config.clientUrl}\n`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
