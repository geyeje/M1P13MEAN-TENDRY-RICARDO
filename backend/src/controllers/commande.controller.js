// backend/src/controllers/commande.controller.js - CHAMPS EN ANGLAIS
const Commande = require('../models/Commande');
const Produit = require('../models/Produit');
const Boutique = require('../models/Boutique');
const { validationResult } = require('express-validator');

// Générer un numéro de commande unique
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ORD${timestamp}${random}`;
};

// ========================================
// 1. CRÉER UNE COMMANDE (Acheteur)
// ========================================
exports.createCommande = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { items, shippingAddress, phone, note } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le panier est vide',
      });
    }

    // ---- Vérifier stock et calculer total ----
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const produit = await Produit.findById(item.productId);

      if (!produit) {
        return res.status(404).json({
          success: false,
          message: `Produit ${item.productId} non trouvé`,
        });
      }

      if (produit.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour "${produit.name}". Disponible : ${produit.stock}`,
        });
      }

      // Prix avec promo si applicable
      const unitPrice = produit.onSale && produit.promoPrice ? produit.promoPrice : produit.price;

      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      validatedItems.push({
        productId: produit._id,
        name: produit.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        color: item.color || null,
        size: item.size || null,
        image: produit.images[0] || null,
      });

      // Déduire du stock
      produit.stock -= item.quantity;
      produit.salesCount += item.quantity;
      await produit.save();
    }

    // ---- Créer la commande ----
    const commande = await Commande.create({
      orderNumber: generateOrderNumber(),
      buyerId: req.user._id, // Utiliser ._id pour la cohérence
      items: validatedItems,
      totalAmount,
      shippingAddress,
      phone,
      note: note || '',
      status: 'pending',
      paymentStatus: 'pending',
      statusHistory: [
        {
          status: 'pending',
          comment: 'Commande créée',
        },
      ],
    });

    await commande.populate('buyerId', 'nom prenom email');

    // ---- Mettre à jour les stats boutiques concernées ----
    const shopIds = [
      ...new Set(
        validatedItems.map(async (item) => {
          const p = await Produit.findById(item.productId);
          return p?.shopId?.toString();
        })
      ),
    ];

    // Méthode simplifiée : chercher les boutiques via les produits
    const productIds = validatedItems.map((i) => i.productId);
    const shopIdsUnique = await Produit.distinct('shopId', { _id: { $in: productIds } });

    for (const shopId of shopIdsUnique) {
      const shopSubtotal = validatedItems
        .filter(async (i) => {
          const p = await Produit.findById(i.productId);
          return p?.shopId?.toString() === shopId.toString();
        })
        .reduce((sum, i) => sum + i.subtotal, 0);

      await Boutique.findByIdAndUpdate(shopId, {
        $inc: {
          commandeqt: 1,
          CA: totalAmount,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      commande,
    });
  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande',
      error: error.message,
    });
  }
};

// ========================================
// 2. MES COMMANDES (Acheteur)
// ========================================
exports.getMyCommandes = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    console.log('📋 getMyCommandes - req.user:', req.user);
    console.log('📋 getMyCommandes - req.user._id:', req.user._id);
    console.log('📋 getMyCommandes - req.user.id:', req.user.id);

    const filter = { buyerId: req.user._id }; // Utiliser ._id plutôt que .id pour être sûr
    if (status) filter.status = status;

    console.log('📋 Filter utilisé:', filter);

    const skip = (page - 1) * limit;

    const commandes = await Commande.find(filter)
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    console.log(`📋 ${commandes.length} commande(s) trouvée(s)`);
    console.log('📋 Commandes:', commandes);

    const total = await Commande.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: commandes.length,
      total,
      totalPages: Math.ceil(total / limit),
      commandes,
    });
  } catch (error) {
    console.error('Erreur mes commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos commandes',
      error: error.message,
    });
  }
};

// ========================================
// 3. COMMANDES DE MA BOUTIQUE (Gérant)
// ========================================
exports.getShopCommandes = async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ userId: req.user.id });
    if (!boutique) {
      return res.status(200).json({
        success: false,
        noShop: true,
        message: 'Boutique non trouvée',
      });
    }

    // IDs des produits de cette boutique
    const productIds = await Produit.distinct('_id', { shopId: boutique._id });

    // Commandes contenant ces produits (recherche sur productId ou product pour compatibilité)
    const commandes = await Commande.find({
      $or: [{ 'items.productId': { $in: productIds } }, { 'items.product': { $in: productIds } }],
    })
      .populate('buyerId', 'firstname lastname nom prenom email')
      .sort('-createdAt');

    // Ne garder que les items de cette boutique
    const filtered = commandes.map((cmd) => {
      const items = cmd.items || [];
      const shopItems = items.filter((item) => {
        const id = item.productId || item.product;
        return id && productIds.some((pId) => pId.toString() === id.toString());
      });
      return {
        ...cmd.toObject(),
        items: shopItems,
        shopTotal: shopItems.reduce((sum, i) => sum + i.subtotal, 0),
      };
    });

    res.status(200).json({
      success: true,
      count: filtered.length,
      commandes: filtered,
    });
  } catch (error) {
    console.error('Erreur commandes boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes',
      error: error.message,
    });
  }
};

// ========================================
// 4. DÉTAILS D'UNE COMMANDE
// ========================================
exports.getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id).populate(
      'buyerId',
      'nom prenom email phone'
    );

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

    // Vérifier les permissions
    let allowed = false;

    if (req.user.role === 'admin') {
      allowed = true;
    } else if (commande.buyerId._id.toString() === req.user.id) {
      allowed = true;
    } else if (req.user.role === 'boutique') {
      const boutique = await Boutique.findOne({ userId: req.user.id });
      const productIds = await Produit.distinct('_id', { shopId: boutique._id });
      allowed = commande.items.some((item) =>
        productIds.some((id) => id.toString() === item.productId.toString())
      );
    }

    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    res.status(200).json({ success: true, commande });
  } catch (error) {
    console.error('Erreur détails commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la commande',
      error: error.message,
    });
  }
};

// ========================================
// 5. CHANGER LE STATUT (Gérant / Admin)
// ========================================
exports.updateStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;

    const validStatuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

    // Vérifier permissions gérant
    if (req.user.role !== 'admin') {
      const boutique = await Boutique.findOne({ userId: req.user.id });
      const productIds = await Produit.distinct('_id', { shopId: boutique._id });
      const isOwner = commande.items.some((item) =>
        productIds.some((id) => id.toString() === item.productId.toString())
      );
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Non autorisé' });
      }
    }

    commande.status = status;

    commande.statusHistory.push({
      status,
      comment: comment || `Statut changé en ${status}`,
    });

    if (status === 'delivered') {
      commande.deliveryDate = new Date();
    }

    await commande.save();

    res.status(200).json({
      success: true,
      message: 'Statut mis à jour',
      commande,
    });
  } catch (error) {
    console.error('Erreur statut commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message,
    });
  }
};

// ========================================
// 6. ANNULER UNE COMMANDE (Acheteur)
// ========================================
exports.cancelCommande = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

    if (commande.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    if (!['pending', 'confirmed'].includes(commande.status)) {
      return res.status(400).json({
        success: false,
        message: "Impossible d'annuler : commande déjà en préparation ou livrée",
      });
    }

    // Remettre les stocks
    for (const item of commande.items) {
      await Produit.findByIdAndUpdate(item.productId, {
        $inc: {
          stock: item.quantity,
          salesCount: -item.quantity,
        },
      });
    }

    commande.status = 'cancelled';
    commande.statusHistory.push({
      status: 'cancelled',
      comment: req.body.reason || 'Annulée par le client',
    });

    await commande.save();

    res.status(200).json({
      success: true,
      message: 'Commande annulée avec succès',
      commande,
    });
  } catch (error) {
    console.error('Erreur annulation commande:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'annulation",
      error: error.message,
    });
  }
};

// ========================================
// 7. TOUTES LES COMMANDES (Admin)
// ========================================
exports.getAllCommandes = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const commandes = await Commande.find(filter)
      .populate('buyerId', 'nom prenom email')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Commande.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: commandes.length,
      total,
      totalPages: Math.ceil(total / limit),
      commandes,
    });
  } catch (error) {
    console.error('Erreur toutes commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes',
      error: error.message,
    });
  }
};

// ========================================
// 8. STATISTIQUES COMMANDES (Admin)
// ========================================
exports.getStats = async (req, res) => {
  try {
    const total = await Commande.countDocuments();

    const byStatus = await Commande.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

    const revenue = await Commande.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const avgCart = await Commande.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, avg: { $avg: '$totalAmount' } } },
    ]);

    // Par jour (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const byDay = await Commande.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        byStatus,
        revenue: revenue[0]?.total || 0,
        avgCart: avgCart[0]?.avg || 0,
        byDay,
      },
    });
  } catch (error) {
    console.error('Erreur stats commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors des statistiques',
      error: error.message,
    });
  }
};
