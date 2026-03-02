const express = require('express');
const paymentController = require('../controllers/payment.controller');
// only need the protect middleware here (no role checking)
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * 🔐 Routes de paiement Stripe - Professionnelles
 */

/**
 * 1️⃣ Créer un PaymentIntent
 * POST /api/payments/create-intent
 * 
 * Authentification requise
 * Body:
 * {
 *   "amount": 99.99,
 *   "items": [...],
 *   "userEmail": "user@example.com"
 * }
 * 
 * Response:
 * {
 *   "clientSecret": "pi_xxx_secret_xxx",
 *   "intentId": "pi_xxx",
 *   "amount": 99.99,
 *   "currency": "eur"
 * }
 */
router.post('/create-intent', protect, paymentController.createPaymentIntent);

/**
 * 2️⃣ Confirmer le paiement et créer la commande
 * POST /api/payments/confirm
 * 
 * Authentification requise
 * Body:
 * {
 *   "paymentIntentId": "pi_xxx",
 *   "shippingAddress": { street, city, postalCode, country },
 *   "cartItems": [{ productId, name, price, quantity }, ...]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "orderId": "xxx",
 *   "message": "Commande confirmée"
 * }
 */
router.post('/confirm', protect, paymentController.confirmPayment);

/**
 * 3️⃣ Webhooks Stripe (sans authentification)
 * POST /api/payments/webhook
 * 
 * Utilisé par Stripe pour notifier des événements de paiement
 * (payment_intent.succeeded, charge.refunded, etc.)
 */
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleWebhook);

/**
 * 4️⃣ Récupérer l'historique des paiements
 * GET /api/payments/history
 * 
 * Authentification requise
 * Response: Array of { _id, total, status, orderDate, paymentIntentId }
 */
router.get('/history', protect, paymentController.getPaymentHistory);

module.exports = router;
