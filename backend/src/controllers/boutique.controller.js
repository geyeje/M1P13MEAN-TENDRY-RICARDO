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
        errors: errors.array() 
      });
    }

    const existingBoutique = await Boutique.findOne({ userId: req.user.id });
    if (existingBoutique) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà une boutique enregistrée'
      });
    }

    const {
      name,           // ← Changé
      description,
      categorie,
      phone,          // ← Changé
      email,
      adresse,
      schedule,       // ← Changé
      socialNetwork   // ← Changé
    } = req.body;

    const boutique = await Boutique.create({
      name,           // ← Changé
      description,
      categorie,
      userId: req.user.id,
      statut: 'en_attente',
      phone,          // ← Changé
      email,
      adresse,
      schedule,       // ← Changé
      socialNetwork,  // ← Changé
      logo: req.file ? req.file.path : null
    });

    await boutique.populate('userId', 'nom prenom email');

    res.status(201).json({
      success: true,
      message: 'Boutique créée avec succès. En attente de validation.',
      boutique
    });

  } catch (error) {
    console.error('Erreur création boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la boutique',
      error: error.message
    });
  }
};

// Obtenir toutes les boutiques
exports.getAllBoutiques = async (req, res) => {
  try {
    const {
      categorie,
      statut,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const filter = {};

    if (req.user?.role !== 'admin') {
      filter.statut = 'active';
    } else if (statut) {
      filter.statut = statut;
    }

    if (categorie) {
      filter.categorie = categorie;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },    // ← Changé
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const boutiques = await Boutique.find(filter)
      .populate('userId', 'nom prenom email')
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
      boutiques
    });

  } catch (error) {
    console.error('Erreur récupération boutiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des boutiques',
      error: error.message
    });
  }
};

// Obtenir une boutique par ID
exports.getBoutiqueById = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id)
      .populate('userId', 'nom prenom email telephone');

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    if (boutique.statut !== 'active') {
      if (!req.user || 
          (req.user.role !== 'admin' && req.user.id !== boutique.userId._id.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Boutique non accessible'
        });
      }
    }

    res.status(200).json({
      success: true,
      boutique
    });

  } catch (error) {
    console.error('Erreur récupération boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la boutique',
      error: error.message
    });
  }
};

// Obtenir ma boutique
exports.getMyBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ userId: req.user.id })
      .populate('userId', 'nom prenom email');

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Vous n\'avez pas encore de boutique enregistrée'
      });
    }

    res.status(200).json({
      success: true,
      boutique
    });

  } catch (error) {
    console.error('Erreur récupération ma boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de votre boutique',
      error: error.message
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
        message: 'Boutique non trouvée'
      });
    }

    if (boutique.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette boutique'
      });
    }

    if (req.user.role !== 'admin' && req.body.statut) {
      delete req.body.statut;
    }

    boutique = await Boutique.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('userId', 'nom prenom email');

    res.status(200).json({
      success: true,
      message: 'Boutique mise à jour avec succès',
      boutique
    });

  } catch (error) {
    console.error('Erreur mise à jour boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la boutique',
      error: error.message
    });
  }
};

// Supprimer une boutique
exports.deleteBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    if (boutique.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cette boutique'
      });
    }

    await boutique.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Boutique supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la boutique',
      error: error.message
    });
  }
};

// Valider une boutique
exports.validateBoutique = async (req, res) => {
  try {
    const { statut, motifRejet } = req.body;

    if (!['active', 'suspendue', 'en_attente'].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const boutique = await Boutique.findById(req.params.id)
      .populate('userId', 'nom prenom email');

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    boutique.statut = statut;
    
    if (statut === 'suspendue' && motifRejet) {
      boutique.motifRejet = motifRejet;
    }

    await boutique.save();

    res.status(200).json({
      success: true,
      message: `Boutique ${statut === 'active' ? 'validée' : 'suspendue'} avec succès`,
      boutique
    });

  } catch (error) {
    console.error('Erreur validation boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation de la boutique',
      error: error.message
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
          count: { $sum: 1 }
        }
      }
    ]);

    const categoriesStats = await Boutique.aggregate([
      {
        $match: { statut: 'active' }
      },
      {
        $group: {
          _id: '$categorie',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Boutique.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        total,
        byStatus: stats,
        byCategory: categoriesStats
      }
    });

  } catch (error) {
    console.error('Erreur stats boutiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};