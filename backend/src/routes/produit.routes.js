// backend/src/routes/produit.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const produitController = require('../controllers/produit.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');


const createProduitValidation = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 3, max: 200 }).withMessage('Entre 3 et 200 caractères'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('La description est requise')
    .isLength({ min: 10 }).withMessage('Minimum 10 caractères'),
  
  body('prix')
    .notEmpty().withMessage('Le prix est requis')
    .isFloat({ min: 0 }).withMessage('Prix invalide'),
  
  body('stock')
    .notEmpty().withMessage('Le stock est requis')
    .isInt({ min: 0 }).withMessage('Stock invalide'),
  
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
      'Autres'
    ]).withMessage('Catégorie invalide')
];

const updateProduitValidation = [
  body('nom')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }),
  
  body('prix')
    .optional()
    .isFloat({ min: 0 }),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
];

const avisValidation = [
  body('note')
    .notEmpty().withMessage('La note est requise')
    .isInt({ min: 1, max: 5 }).withMessage('Note entre 1 et 5'),
  
  body('commentaire')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Commentaire trop long')
];


// Liste des produits (avec filtres)
router.get('/', produitController.getAllProduits);

// Détails d'un produit
router.get('/:id', produitController.getProduitById);


// Mes produits
router.get(
  '/me/myproduits',
  protect,
  authorize('boutique'),
  produitController.getMyProduits
);

// Créer un produit
router.post(
  '/',
  protect,
  authorize('boutique'),
  upload.array('images', 5),  // Max 5 images
  createProduitValidation,
  produitController.createProduit
);

// Modifier un produit
router.put(
  '/:id',
  protect,
  authorize('boutique', 'admin'),
  upload.array('images', 5),
  updateProduitValidation,
  produitController.updateProduit
);

// Supprimer un produit
router.delete(
  '/:id',
  protect,
  authorize('boutique', 'admin'),
  produitController.deleteProduit
);

// Mettre à jour le stock
router.patch(
  '/:id/stock',
  protect,
  authorize('boutique', 'admin'),
  produitController.updateStock
);


// Ajouter un avis
router.post(
  '/:id/avis',
  protect,
  authorize('acheteur'),
  avisValidation,
  produitController.addAvis
);


// Statistiques
router.get(
  '/stats/overview',
  protect,
  authorize('admin'),
  produitController.getProduitsStats
);

module.exports = router;