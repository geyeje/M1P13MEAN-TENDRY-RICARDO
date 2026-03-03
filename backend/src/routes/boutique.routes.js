// backend/src/routes/boutique.routes.js - VERSION ANGLAISE
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const boutiqueController = require('../controllers/boutique.controller');
const { protect, authorize, optionalProtect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Validation pour création
const createBoutiqueValidation = [
  body('name') // ← Changé de 'nom' à 'name'
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 3, max: 100 })
    .withMessage('Le nom doit contenir entre 3 et 100 caractères'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La description est requise')
    .isLength({ min: 10, max: 1000 })
    .withMessage('La description doit contenir entre 10 et 1000 caractères'),

  body('category')
    .notEmpty()
    .withMessage('La catégorie est requise')
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
      'Services',
      'Autres',
    ])
    .withMessage('Catégorie invalide'),

  body('phone') // ← Changé de 'telephone' à 'phone'
    .trim()
    .notEmpty()
    .withMessage('Le téléphone est requis')
    .matches(/^[+0-9][0-9 ]{6,14}$/)
    .withMessage('Numéro de téléphone invalide'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage("L'email est requis")
    .isEmail()
    .withMessage('Email invalide'),

  body('adresse').trim().notEmpty().withMessage("L'adresse est requise"),
];

// Validation pour mise à jour
const updateBoutiqueValidation = [
  body('name') // ← Changé
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Le nom doit contenir entre 3 et 100 caractères'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La description doit contenir entre 10 et 1000 caractères'),

  body('phone') // ← Changé
    .matches(/^[+0-9][0-9 ]{6,14}$/)
    .withMessage('Numéro de téléphone invalide'),

  body('email').optional().isEmail().withMessage('Email invalide'),
];

// Routes publiques
router.get('/featured', boutiqueController.getFeaturedBoutiques);
router.get('/', boutiqueController.getAllBoutiques);
// détails boutique : on peut fournir un JWT optionnel pour récupérer myRating
router.get('/:id', optionalProtect, boutiqueController.getBoutiqueById);

// Route pour soumettre une évaluation (protégée, tous les utilisateurs connectés)
router.post('/:id/rate', protect, boutiqueController.submitRating);

// Routes protégées - Gérant
router.get('/me/myboutique', protect, authorize('boutique'), boutiqueController.getMyBoutique);

router.post(
  '/',
  protect,
  authorize('boutique'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  createBoutiqueValidation,
  boutiqueController.createBoutique
);

router.put(
  '/:id',
  protect,
  authorize('boutique', 'admin'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  updateBoutiqueValidation,
  boutiqueController.updateBoutique
);

router.delete('/:id', protect, authorize('boutique', 'admin'), boutiqueController.deleteBoutique);

// Routes admin
router.get('/stats/overview', protect, authorize('admin'), boutiqueController.getBoutiquesStats);

router.put('/:id/validate', protect, authorize('admin'), boutiqueController.validateBoutique);

module.exports = router;
