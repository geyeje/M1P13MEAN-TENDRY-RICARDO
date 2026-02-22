const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Import authentication middleware
const { protect, authorize } = require('../middlewares/auth.middleware');

// GET /api/admin/dashboard
// Protect makes sure the user is logged in
// Authorize('admin') makes sure the user has the admin role
router.get('/dashboard', protect, authorize('admin'), adminController.getDashboardStats);

module.exports = router;
