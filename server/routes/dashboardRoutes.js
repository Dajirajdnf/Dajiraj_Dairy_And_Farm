const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboard, getDashboardCharts } = require('../controllers/dashboardController');

router.use(protect);
router.use(authorize('admin', 'staff'));

router.get('/', getDashboard);
router.get('/charts', getDashboardCharts);

module.exports = router;
