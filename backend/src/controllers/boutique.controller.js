// backend/src/controllers/boutique.controller.js - VERSION ANGLAISE
const Boutique = require('../models/Boutique');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Créer une boutique
exports.createBoutique = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const existingBoutique = await Boutique.findOne({ userId: req.user.id });
    if (existingBoutique) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà une boutique enregistrée',
      });
    }

    const { name, description, category, phone, email, adresse, schedule, socialNetwork } =
      req.body;

    const parsedSocial =
      typeof socialNetwork === 'string' ? JSON.parse(socialNetwork) : socialNetwork;

    const logo = req.files && req.files['logo'] ? req.files['logo'][0].path : null;
    const banner = req.files && req.files['banner'] ? req.files['banner'][0].path : null;

    const boutique = await Boutique.create({
      name,
      description,
      category,
      userId: req.user.id,
      status: 'en_attente',
      phone,
      email,
      address: adresse,
      schedule,
      socialNetwork: parsedSocial,
      logo,
      banner,
    });

    //populer des infos clients

    await boutique.populate('userId', 'nom prenom email');

    res.status(201).json({
      success: true,
      message: 'Boutique créée avec succès. En attente de validation.',
      boutique,
    });
  } catch (error) {
    console.error('Erreur création boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la boutique',
      error: error.message,
    });
  }
};

///obtenir tout les boutiques
// @desc    Liste toutes les boutiques (avec filtres)
// @route   GET /api/boutiques
// @access  Public

exports.getAllBoutiques = async (req, res) => {
  try {
    //recuperer les parametre de recherche/filtrage
    const { category, status, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const filter = {};

    //si pas admin montrer seulement les boutiques actices
    if (req.user?.role !== 'admin') {
      filter.status = 'active';
    } else if (status) {
      //admin peut filtrer par sstatus
      filter.status = status;
    }

    //filtrer par categories
    if (category) {
      filter.category = category;
    }

    //recherche textuel

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }, // ← Changé
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const boutiques = await Boutique.find(filter)
      .populate('userId', 'firstname lastname email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Boutique.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: boutiques.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      boutiques,
    });
  } catch (error) {
    console.error('Erreur récupération boutiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des boutiques',
      error: error.message,
    });
  }
};

// Obtenir une boutique par ID
exports.getBoutiqueById = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id).populate(
      'userId',
      'firstname lastname email phone '
    );
    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'boutique non trouvé',
      });
    }
    //si boutique n'est pas acticve , asdmin et prop peut acivé
    if (boutique.status !== 'active') {
      if (
        !req.user ||
        (req.user.role !== 'admin' && req.user.id !== boutique.userId._id.toString())
      ) {
        return res.status(403).json({
          success: false,
          message: 'Boutique non accessible',
        });
      }
    }

    res.status(200).json({
      success: true,
      boutique,
    });
  } catch (error) {
    console.error('Erreur récupération boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la boutique',
      error: error.message,
    });
  }
};

// Obtenir ma boutique
exports.getMyBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ userId: req.user.id }).populate(
      'userId',
      'firstname lastname email'
    );

    if (!boutique) {
      return res.status(200).json({
        success: false,
        noShop: true,
        message: "Vous n'avez pas encore de boutique enregistrée",
      });
    }

    res.status(200).json({
      success: true,
      boutique,
    });
  } catch (error) {
    console.error('Erreur récupération ma boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de votre boutique',
      error: error.message,
    });
  }
};

// Mettre à jour une boutique
exports.updateBoutique = async (req, res) => {
  try {
    let boutique = await Boutique.findById(req.params.id);

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée',
      });
    }

    if (boutique.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette boutique',
      });
    }

    // 3. Empêcher la modification du statut par le gérant
    if (req.user.role !== 'admin' && req.body.status) {
      delete req.body.status; // Seul l'admin peut changer le statut
    }

    // Gérer les fichiers
    if (req.files) {
      if (req.files['logo']) req.body.logo = req.files['logo'][0].path;
      if (req.files['banner']) req.body.banner = req.files['banner'][0].path;
    }

    // Mapping des champs frontend vers backend
    if (req.body.adresse) req.body.address = req.body.adresse;

    if (req.body.socialNetwork && typeof req.body.socialNetwork === 'string') {
      try {
        req.body.socialNetwork = JSON.parse(req.body.socialNetwork);
      } catch (e) {}
    }

    boutique = await Boutique.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('userId', 'firstname lastname email');

    res.status(200).json({
      success: true,
      message: 'Boutique mise à jour avec succès',
      boutique,
    });
  } catch (error) {
    console.error('Erreur mise à jour boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la boutique',
      error: error.message,
    });
  }
};

// ========================================
// 6. SUPPRIMER UNE BOUTIQUE
// ========================================
// @desc    Supprimer une boutique
// @route   DELETE /api/boutiques/:id
// @access  Private (propriétaire ou admin)
exports.deleteBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée',
      });
    }

    if (boutique.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cette boutique',
      });
    }

    await boutique.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Boutique supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur suppression boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la boutique',
      error: error.message,
    });
  }
};

// Valider une boutique
exports.validateBoutique = async (req, res) => {
  try {
    const { statut, motifRejet } = req.body;

    // Validation du statut
    if (!['active', 'suspended', 'pending'].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide',
      });
    }

    const boutique = await Boutique.findById(req.params.id).populate(
      'userId',
      'firstname lastname email'
    );

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée',
      });
    }

    // Mettre à jour le statut
    boutique.status = statut;

    // Si rejet, enregistrer le motif (optionnel: ajouter ce champ au modèle)
    if (statut === 'suspended' && motifRejet) {
      boutique.motifRejet = motifRejet;
    }

    await boutique.save();

    res.status(200).json({
      success: true,
      message: `Boutique ${statut === 'active' ? 'validée' : 'suspendue'} avec succès`,
      boutique,
    });
  } catch (error) {
    console.error('Erreur validation boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation de la boutique',
      error: error.message,
    });
  }
};

// Statistiques
exports.getBoutiquesStats = async (req, res) => {
  try {
    const stats = await Boutique.aggregate([
      {
        $group: {
          _id: '$statut',
          count: { $sum: 1 },
        },
      },
    ]);

    const categoriesStats = await Boutique.aggregate([
      {
        $match: { statut: 'active' },
      },
      {
        $group: {
          _id: '$categorie',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Boutique.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        total,
        byStatus: stats,
        byCategory: categoriesStats,
      },
    });
  } catch (error) {
    console.error('Erreur stats boutiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message,
    });
  }
};
