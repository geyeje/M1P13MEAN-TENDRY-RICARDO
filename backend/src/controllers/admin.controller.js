const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Produit = require('../models/Produit');
const Commande = require('../models/Commande');
const Settings = require('../models/Settings');

/**
 * @desc    Get complete admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. User Statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Group users by role
    const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);

    // Get recent users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');

    // 2. Shop Statistics
    const totalShops = await Boutique.countDocuments();
    const activeShops = await Boutique.countDocuments({ status: 'active' });
    const pendingShops = await Boutique.countDocuments({ status: 'en_attente' });

    const shopsByStatus = await Boutique.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const recentShops = await Boutique.find()
      .populate('userId', 'firstname lastname email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get top shops by revenue (CA)
    const topShops = await Boutique.find({ status: 'active' })
      .populate('userId', 'firstname lastname email')
      .sort({ CA: -1 })
      .limit(5);

    // 3. Product Statistics
    const totalProducts = await Produit.countDocuments();
    const inStock = await Produit.countDocuments({ stock: { $gt: 0 } });
    const outOfStock = await Produit.countDocuments({ stock: { $eq: 0 } });
    const onSale = await Produit.countDocuments({ onSale: true });

    const productsByCategory = await Produit.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // Average Price
    const avgPriceAgg = await Produit.aggregate([
      { $group: { _id: null, avg: { $avg: '$price' } } },
    ]);
    const avgPrice = avgPriceAgg.length > 0 ? Math.round(avgPriceAgg[0].avg) : 0;

    // Top Selling Products
    const topSellingProducts = await Produit.find().sort({ salesCount: -1 }).limit(5);

    // 4. Order & Revenue Statistics
    const totalOrders = await Commande.countDocuments();
    const pendingOrders = await Commande.countDocuments({ status: 'pending' });
    const deliveredOrders = await Commande.countDocuments({ status: 'delivered' });

    const ordersByStatus = await Commande.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const recentOrders = await Commande.find()
      .populate('buyerId', 'firstname lastname email')
      .sort({ createdAt: -1 })
      .limit(5);

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
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          byRole: usersByRole,
          recent: recentUsers,
        },
        shops: {
          total: totalShops,
          active: activeShops,
          pending: pendingShops,
          byStatus: shopsByStatus,
          topByRevenue: topShops,
          recent: recentShops,
        },
        products: {
          total: totalProducts,
          inStock: inStock,
          outOfStock: outOfStock,
          onSale: onSale,
          avgPrice: avgPrice,
          byCategory: productsByCategory,
          topSelling: topSellingProducts,
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
          inactiveUsers: inactiveUsers,
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

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération utilisateurs' });
  }
};

/**
 * @desc    Toggle user active status
 * @route   PATCH /api/admin/users/:id/toggle-active
 * @access  Private/Admin
 */
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur modification statut' });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Si c'est un gérant, supprimer aussi sa boutique ? (Optionnel selon business logic)
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression utilisateur' });
  }
};

/**
 * @desc    Get all shops (admin - no status filter)
 * @route   GET /api/admin/shops
 * @access  Private/Admin
 */
exports.getAllShops = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 100 } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const boutiques = await Boutique.find(filter)
      .populate('userId', 'firstname lastname email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Boutique.countDocuments(filter);

    res.json({
      success: true,
      count: boutiques.length,
      total,
      boutiques,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération boutiques' });
  }
};

/**
 * @desc    Get platform settings
 * @route   GET /api/admin/settings
 * @access  Private/Admin
 */
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération paramètres' });
  }
};

/**
 * @desc    Update platform settings
 * @route   PUT /api/admin/settings
 * @access  Private/Admin
 */
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json({ success: true, settings, message: 'Paramètres mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour paramètres' });
  }
};
/**
 * @desc    Get public settings (visible to everyone)
 * @route   GET /api/settings
 * @access  Public
 */
exports.getPublicSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    // Return only non-sensitive settings to the public
    const publicSettings = {
      siteName: settings.siteName,
      contactEmail: settings.contactEmail,
      maintenanceMode: settings.maintenanceMode,
      allowRegistrations: settings.allowRegistrations,
      multiVendor: settings.multiVendor,
      defaultCurrency: settings.defaultCurrency,
      siteDescription: settings.siteDescription,
    };

    res.json({ success: true, settings: publicSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération paramètres publics' });
  }
};
