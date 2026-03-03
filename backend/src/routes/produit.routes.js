// backend/src/routes/produit.routes.js - VERSION CORRIGÉE
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body } = require('express-validator');
const ctrl = require('../controllers/produit.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// ========================================
// VALIDATION
// ========================================
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
      'Mode & Vêtements', 'Électronique & High-tech', 'Alimentation & Boissons',
      'Beauté & Cosmétiques', 'Sport & Loisirs', 'Maison & Décoration',
      'Livres & Culture', 'Jouets & Enfants', 'Santé & Bien-être',
      'Bijouterie & Accessoires', 'Autres'
    ]).withMessage('Catégorie invalide')
];

const reviewValidation = [
  body('rating').notEmpty().withMessage('La note est requise')
    .isInt({ min: 1, max: 5 }).withMessage('Note entre 1 et 5'),
  body('comment').optional().trim().isLength({ max: 500 })
];

// ========================================
// MULTER CONFIGURATION
// ========================================
const uploadDir = 'uploads/products';

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Dossier créé:', uploadDir);
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// Configuration Multer
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB max par fichier
    files: 5 // Max 5 fichiers
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      console.log('✅ Image acceptée:', file.originalname);
      return cb(null, true);
    }
    
    console.log('❌ Image rejetée:', file.originalname);
    cb(new Error('Seules les images (JPEG, PNG, GIF, WEBP) sont autorisées!'));
  }
});

// ========================================
// ROUTES PUBLIQUES (sans authentification)
// ========================================
router.get('/featured', ctrl.getFeaturedProduits); // Produits vedettes
router.get('/', ctrl.getAllProduits);              // Liste tous les produits
router.get('/:id', ctrl.getProduitById);           // Détails d'un produit

// ========================================
// ROUTES GÉRANT (authentification requise)
// ========================================
router.get('/me/myproduits', 
  protect, 
  authorize('boutique'), 
  ctrl.getMyProduits
);                                                  // Mes produits

router.post('/', 
  protect, 
  authorize('boutique'), 
  upload.array('images', 5),                       // ← Upload max 5 images
  createValidation, 
  ctrl.createProduit
);                                                  // Créer produit

router.put('/:id', 
  protect, 
  authorize('boutique', 'admin'), 
  upload.array('images', 5),                       // ← Upload max 5 images
  ctrl.updateProduit
);                                                  // Modifier produit

router.delete('/:id', 
  protect, 
  authorize('boutique', 'admin'), 
  ctrl.deleteProduit
);                                                  // Supprimer produit

router.patch('/:id/stock', 
  protect, 
  authorize('boutique', 'admin'), 
  ctrl.updateStock
);                                                  // Mettre à jour stock

// ========================================
// ROUTES ACHETEUR
// ========================================
router.post('/:id/reviews', 
  protect, 
  authorize('customer'), 
  reviewValidation, 
  ctrl.addReview
);                                                  // Ajouter un avis

module.exports = router;