const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Produit = require('../models/Produit');
const Commande = require('../models/Commande');

/**
 * @desc    Get complete admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. User Statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      /* active status logic if applicable or just total */
    });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Group users by role
    const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);

    // Get recent users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');

    // 2. Shop Statistics
    const totalShops = await Boutique.countDocuments();
    const activeShops = await Boutique.countDocuments({ statut: 'active' });
    const pendingShops = await Boutique.countDocuments({ statut: 'en_attente' });

    const shopsByStatus = await Boutique.aggregate([
      { $group: { _id: '$statut', count: { $sum: 1 } } },
    ]);

    const recentShops = await Boutique.find()
      .populate('owner', 'nom prenom email')
      .sort({ createdAt: -1 })
      .limit(5);

    // TODO: shops topByRevenue (complex aggregation, skipping for MVP or mocking for now)
    const topShops = await Boutique.find({ statut: 'active' }).limit(5);

    // 3. Product Statistics
    const totalProducts = await Produit.countDocuments();
    const inStock = await Produit.countDocuments({ stock: { $gt: 0 } });
    const outOfStock = await Produit.countDocuments({ stock: { $eq: 0 } });
    const onSale = await Produit.countDocuments({ promotion: { $exists: true } }); // Assuming promotion logic

    const productsByCategory = await Produit.aggregate([
      { $group: { _id: '$categorie', count: { $sum: 1 } } },
    ]);

    // 4. Order & Revenue Statistics
    const totalOrders = await Commande.countDocuments();
    const pendingOrders = await Commande.countDocuments({ status: 'pending' });
    const deliveredOrders = await Commande.countDocuments({ status: 'delivered' });

    const ordersByStatus = await Commande.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const recentOrders = await Commande.find().sort({ createdAt: -1 }).limit(5);

    // Revenue aggregations
    const revenueAgg = await Commande.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    const thisMonthRevenueAgg = await Commande.aggregate([
      { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const thisMonthRevenue = thisMonthRevenueAgg.length > 0 ? thisMonthRevenueAgg[0].total : 0;

    const avgCart = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Charts - Orders by day for the last 30 days
    const ordersByDay = await Commande.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Charts - Users by day
    const usersByDay = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Final Payload matching Frontend interface
    res.json({
      success: true,
      dashboard: {
        users: {
          total: totalUsers,
          active: totalUsers, // adjust if a soft delete or 'active' property exists
          newThisMonth: newUsersThisMonth,
          byRole: usersByRole,
          recent: recentUsers,
        },
        shops: {
          total: totalShops,
          active: activeShops,
          pending: pendingShops,
          byStatus: shopsByStatus,
          topByRevenue: topShops, // Placeholder
          recent: recentShops,
        },
        products: {
          total: totalProducts,
          inStock: inStock,
          outOfStock: outOfStock,
          onSale: onSale,
          avgPrice: 0, // Placeholder
          byCategory: productsByCategory,
          topSelling: [], // Placeholder
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          delivered: deliveredOrders,
          byStatus: ordersByStatus,
          recent: recentOrders,
        },
        revenue: {
          total: totalRevenue,
          thisMonth: thisMonthRevenue,
          avgCart: avgCart,
        },
        charts: {
          ordersByDay,
          usersByDay,
        },
        alerts: {
          pendingShops,
          pendingOrders,
          outOfStock,
          inactiveUsers: 0,
        },
      },
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques du tableau de bord.',
    });
  }
};
