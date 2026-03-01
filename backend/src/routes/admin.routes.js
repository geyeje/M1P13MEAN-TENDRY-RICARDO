const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Import authentication middleware
const { protect, authorize } = require('../middlewares/auth.middleware');

// GET /api/admin/dashboard
// Protect makes sure the user is logged in
// Authorize('admin') makes sure the user has the admin role
router.get('/dashboard', protect, authorize('admin'), adminController.getDashboardStats);

// Users management
router.get('/users', protect, authorize('admin'), adminController.getUsers);
router.patch(
  '/users/:id/toggle-active',
  protect,
  authorize('admin'),
  adminController.toggleUserActive
);
router.delete('/users/:id', protect, authorize('admin'), adminController.deleteUser);

// Shops management
router.get('/shops', protect, authorize('admin'), adminController.getAllShops);

module.exports = router;
