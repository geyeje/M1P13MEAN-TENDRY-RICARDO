const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const boutiqueController = require('../controllers/boutique.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// ========================================
// VALIDATION DES DONNÉES
// ========================================

const createBoutiqueValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 3, max: 100 }).withMessage('Le nom doit contenir entre 3 et 100 caractères'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('La description est requise')
    .isLength({ min: 10, max: 1000 }).withMessage('La description doit contenir entre 10 et 1000 caractères'),
  
  body('categorie')
    .notEmpty().withMessage('La catégorie est requise')
    .isIn([
      'Mode & Vêtements',
      'Électronique & High-tech',
      'Alimentation & Boissons',
      'Beauté & Cosmétiques',
      'Sport & Loisirs',
      'Maison & Décoration',
      'Livres & Culture',
      'Jouets & Enfants',
      'Santé & Bien-être',
      'Bijouterie & Accessoires',
      'Services'
    ]).withMessage('Catégorie invalide'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Le téléphone est requis')
    .matches(/^[0-9]{10}$/).withMessage('Numéro de téléphone invalide (10 chiffres)'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide'),
  
  body('adresse')
    .trim()
    .notEmpty().withMessage('L\'adresse est requise')
];

const updateBoutiqueValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Le nom doit contenir entre 3 et 100 caractères'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage('La description doit contenir entre 10 et 1000 caractères'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Numéro de téléphone invalide'),
  
  body('email')
    .optional()
    .isEmail().withMessage('Email invalide')
];

// ========================================
// ROUTES PUBLIQUES
// ========================================

// Liste des boutiques (avec filtres)
// GET /api/boutiques?categorie=Mode&page=1&limit=10&search=nike
router.get('/', boutiqueController.getAllBoutiques);

// Détails d'une boutique
// GET /api/boutiques/64abc123def456789
router.get('/:id', boutiqueController.getBoutiqueById);

// ========================================
// ROUTES PROTÉGÉES - GÉRANT BOUTIQUE
// ========================================

// Ma boutique (gérant connecté)
// GET /api/boutiques/me/myboutique
router.get(
  '/me/myboutique',
  protect,
  authorize('boutique'),
  boutiqueController.getMyBoutique
);

// Créer une boutique
// POST /api/boutiques
router.post(
  '/',
  protect,
  authorize('boutique'),
  upload.single('logo'),  // Upload du logo
  createBoutiqueValidation,
  boutiqueController.createBoutique
);

// Modifier une boutique
// PUT /api/boutiques/64abc123def456789
router.put(
  '/:id',
  protect,
  authorize('boutique', 'admin'),
  upload.single('logo'),
  updateBoutiqueValidation,
  boutiqueController.updateBoutique
);

// Supprimer une boutique
// DELETE /api/boutiques/64abc123def456789
router.delete(
  '/:id',
  protect,
  authorize('boutique', 'admin'),
  boutiqueController.deleteBoutique
);

// ========================================
// ROUTES ADMIN UNIQUEMENT
// ========================================

// Statistiques boutiques
// GET /api/boutiques/stats/overview
router.get(
  '/stats/overview',
  protect,
  authorize('admin'),
  boutiqueController.getBoutiquesStats
);

// Valider/Suspendre une boutique
// PUT /api/boutiques/64abc123def456789/validate
router.put(
  '/:id/validate',
  protect,
  authorize('admin'),
  boutiqueController.validateBoutique
);

module.exports = router;