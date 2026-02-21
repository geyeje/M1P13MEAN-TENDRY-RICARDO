// backend/src/routes/produit.routes.js - CHAMPS EN ANGLAIS
const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const ctrl    = require('../controllers/produit.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload  = require('../middlewares/upload.middleware');

const createValidation = [
  body('name').trim().notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 3, max: 200 }).withMessage('Entre 3 et 200 caractères'),
  body('description').trim().notEmpty().withMessage('La description est requise')
    .isLength({ min: 10 }).withMessage('Minimum 10 caractères'),
  body('price').notEmpty().withMessage('Le prix est requis')
    .isFloat({ min: 0 }).withMessage('Prix invalide'),
  body('stock').notEmpty().withMessage('Le stock est requis')
    .isInt({ min: 0 }).withMessage('Stock invalide'),
  body('category').notEmpty().withMessage('La catégorie est requise')
    .isIn([
      'Mode & Vêtements','Électronique & High-tech','Alimentation & Boissons',
      'Beauté & Cosmétiques','Sport & Loisirs','Maison & Décoration',
      'Livres & Culture','Jouets & Enfants','Santé & Bien-être',
      'Bijouterie & Accessoires','Autres'
    ]).withMessage('Catégorie invalide')
];

const reviewValidation = [
  body('rating').notEmpty().withMessage('La note est requise')
    .isInt({ min: 1, max: 5 }).withMessage('Note entre 1 et 5'),
  body('comment').optional().trim().isLength({ max: 500 })
];

// Public
router.get('/',          ctrl.getAllProduits);
router.get('/:id',       ctrl.getProduitById);

// Gérant
router.get('/me/myproduits',  protect, authorize('boutique'), ctrl.getMyProduits);
router.post('/',               protect, authorize('boutique'), upload.array('images', 5), createValidation, ctrl.createProduit);
router.put('/:id',             protect, authorize('boutique', 'admin'), upload.array('images', 5), ctrl.updateProduit);
router.delete('/:id',          protect, authorize('boutique', 'admin'), ctrl.deleteProduit);
router.patch('/:id/stock',     protect, authorize('boutique', 'admin'), ctrl.updateStock);

// Acheteur
router.post('/:id/reviews', protect, authorize('acheteur'), reviewValidation, ctrl.addReview);

module.exports = router;