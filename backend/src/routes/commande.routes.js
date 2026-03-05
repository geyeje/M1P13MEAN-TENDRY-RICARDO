// backend/src/routes/commande.routes.js - CHAMPS EN ANGLAIS
const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const ctrl    = require('../controllers/commande.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const createValidation = [
  body('items').isArray({ min: 1 }).withMessage('Le panier doit contenir au moins 1 article'),
  body('items.*.productId').notEmpty().withMessage('ID produit requis'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantité invalide (min 1)'),
  body('shippingAddress').trim().notEmpty().withMessage('Adresse de livraison requise'),
  body('phone').trim().notEmpty().withMessage('Téléphone requis')
    .matches(/^[0-9]{10}$/).withMessage('Numéro invalide (10 chiffres)')
];

// ---- Acheteur (Customer) ----
router.post('/',
  protect, authorize('customer'),
  createValidation,
  ctrl.createCommande
);

router.get('/me/myorders',
  protect, authorize('customer'),
  ctrl.getMyCommandes
);

router.patch('/:id/cancel',
  protect, authorize('customer'),
  ctrl.cancelCommande
);

// ---- Gérant ----
router.get('/shop/orders',
  protect, authorize('store'),
  ctrl.getShopCommandes
);

router.patch('/:id/status',
  protect, authorize('store', 'admin'),
  ctrl.updateStatus
);

// ---- Mixte (vérification dans le controller) ----
router.get('/:id',
  protect,
  ctrl.getCommandeById
);

// ---- Admin ----
router.get('/',
  protect, authorize('admin'),
  ctrl.getAllCommandes
);

router.get('/stats/overview',
  protect, authorize('admin'),
  ctrl.getStats
);

module.exports = router;