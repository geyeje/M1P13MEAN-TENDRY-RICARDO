// backend/src/controllers/boutique.controller.js - VERSION ANGLAISE
const Boutique = require('../models/Boutique');
const User = require('../models/User');
const Rating = require('../models/Rating');
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

    const logo =
      req.files && req.files['logo'] ? `/uploads/boutiques/${req.files['logo'][0].filename}` : null;
    const banner =
      req.files && req.files['banner']
        ? `/uploads/boutiques/${req.files['banner'][0].filename}`
        : null;

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

// Obtenir boutiques vedettes
exports.getFeaturedBoutiques = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const filter = { status: 'active', featured: true };

    const boutiques = await Boutique.find(filter)
      .sort('-createdAt')
      .limit(limit);

    res.status(200).json({ success: true, boutiques });
  } catch (error) {
    console.error('Erreur récupération boutiques vedettes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des boutiques vedettes',
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

    // ajouter la note de l'utilisateur courant si connecté
    let myRating = null;
    console.log('[boutiqueController] req.user:', req.user ? req.user.id : 'none');
    if (req.user) {
      const existing = await Rating.findOne({
        userId: req.user.id,
        boutiqueId: req.params.id,
      });
      console.log('[boutiqueController] found existing rating:', existing);
      if (existing) {
        myRating = existing.rating;
      }
    }

    res.status(200).json({
      success: true,
      boutique,
      myRating,
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

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
      if (req.files['logo']) req.body.logo = `/uploads/boutiques/${req.files['logo'][0].filename}`;
      if (req.files['banner'])
        req.body.banner = `/uploads/boutiques/${req.files['banner'][0].filename}`;
    }

    // Mapping des champs frontend vers backend
    if (req.body.adresse) req.body.address = req.body.adresse;

    if (req.body.socialNetwork && typeof req.body.socialNetwork === 'string') {
      try {
        req.body.socialNetwork = JSON.parse(req.body.socialNetwork);
      } catch (e) {}
    }

    if (req.body.schedule && typeof req.body.schedule === 'string') {
      try {
        req.body.schedule = JSON.parse(req.body.schedule);
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

    // Map possible values to the model's enum
    const statusMap = {
      active: 'active',
      suspended: 'suspendue',
      suspendue: 'suspendue',
      pending: 'en_attente',
      en_attente: 'en_attente',
    };
    const mappedStatus = statusMap[statut];

    if (!mappedStatus) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Valeurs acceptées : active, suspended, pending',
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
    boutique.status = mappedStatus;

    // Si suspension, enregistrer le motif (optionnel)
    if (mappedStatus === 'suspendue' && motifRejet) {
      boutique.motifRejet = motifRejet;
    }

    await boutique.save();

    res.status(200).json({
      success: true,
      message: `Boutique ${mappedStatus === 'active' ? 'validée' : 'suspendue'} avec succès`,
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

// Soumettre une évaluation pour une boutique
exports.submitRating = async (req, res) => {
  try {
    const { id: boutiqueId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validation basique du rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'La note doit être entre 1 et 5',
      });
    }

    // Vérifier que la boutique existe
    const boutique = await Boutique.findById(boutiqueId);
    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée',
      });
    }

    // Vérifier si l'utilisateur a déjà noté cette boutique
    let existingRating = await Rating.findOne({
      userId,
      boutiqueId,
    });

    if (existingRating) {
      // Mettre à jour l'évaluation existante
      existingRating.rating = rating;
      if (comment) {
        existingRating.comment = comment;
      }
      await existingRating.save();
    } else {
      // Créer une nouvelle évaluation
      existingRating = await Rating.create({
        userId,
        boutiqueId,
        rating,
        comment: comment || null,
      });
    }

    // Recalculer la moyenne des notes et le nombre d'avis
    const ratings = await Rating.find({ boutiqueId });
    const averageRating =
      ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

    // Mettre à jour la boutique
    boutique.note = Math.round(averageRating * 10) / 10; // Arrondir à 1 décimale
    boutique.reviewCount = ratings.length;
    await boutique.save();

    res.status(200).json({
      success: true,
      message: 'Évaluation soumise avec succès',
      rating: existingRating,
      boutique: {
        _id: boutique._id,
        avgRating: boutique.note,
        reviewCount: boutique.reviewCount,
      },
    });
  } catch (error) {
    console.error('Erreur soumission évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la soumission de l\'évaluation',
      error: error.message,
    });
  }
};
