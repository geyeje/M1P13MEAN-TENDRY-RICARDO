// require stripe with API key; on startup we should have an env var named STRIPE_SECRET_KEY
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❗ STRIPE_SECRET_KEY is not defined in environment.');
  // the stripe module will also throw later, but fail early with meaningful message
  throw new Error('Missing Stripe API key (check STRIPE_SECRET_KEY)');
}
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Commande = require('../models/Commande');
const User = require('../models/User');

/**
 * Créer un PaymentIntent
 * POST /api/payments/create-intent
 * 
 * Body requis:
 * - amount: number (montant en euros)
 * - items: array (produits du panier pour la métadonnée)
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, items, userEmail } = req.body;
    const userId = req.user?.id;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Montant invalide',
        code: 'INVALID_AMOUNT' 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentification requise',
        code: 'UNAUTHORIZED' 
      });
    }

    // ✅ Stripe fonctionne EN CENTIMES (10€ = 1000)
    const amountInCents = Math.round(amount * 100);

    // Créer le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        userId: userId.toString(),
        itemCount: items?.length || 0,
        description: `Commande pour ${userEmail}`
      },
      receipt_email: userEmail, // Reçu automatique envoyé par Stripe
      // `statement_descriptor` n'est plus supporté pour card. utiliser suffixe ou laisser vide
      statement_descriptor_suffix: 'MALL-SHOPPING', // Apparaît sur le relevé bancaire (suffixe limité à 22 caractères)
    });

    // Retourner le client secret au frontend
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      intentId: paymentIntent.id,
      amount: amount,
      currency: 'eur'
    });

  } catch (error) {
    console.error('Erreur PaymentIntent:', error);
    res.status(500).json({ 
      error: error.message,
      code: 'PAYMENT_INTENT_FAILED'
    });
  }
};

/**
 * Confirmer le paiement et créer la commande
 * POST /api/payments/confirm
 * 
 * Body requis:
 * - paymentIntentId: string (ID du PaymentIntent)
 * - shippingAddress: object (adresse de livraison)
 * - cartItems: array (détails des articles)
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, shippingAddress, cartItems } = req.body;
    const userId = req.user?.id;

    if (!paymentIntentId || !shippingAddress || !cartItems?.length) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        code: 'MISSING_DATA' 
      });
    }

    // Récupérer le PaymentIntent depuis Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Vérifier que le paiement est réussi
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        error: `Paiement non confirmé. Status: ${paymentIntent.status}`,
        code: 'PAYMENT_NOT_SUCCEEDED'
      });
    }

    // ✅ ÉTAPE CRITIQUE: Vérifier le montant (sécurité)
    const expectedAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (Math.abs(paymentIntent.amount / 100 - expectedAmount) > 0.01) {
      return res.status(400).json({ 
        error: 'Montant du paiement ne correspond pas',
        code: 'AMOUNT_MISMATCH'
      });
    }

    // Créer la commande en base de données
    const newCommande = new Commande({
      userId: userId,
      items: cartItems,
      total: paymentIntent.amount / 100,
      shippingAddress: shippingAddress,
      paymentMethod: 'stripe',
      paymentIntentId: paymentIntentId,
      stripeChargeId: paymentIntent.charges.data[0]?.id,
      status: 'confirmed', // ou 'pending' selon ta logique
      orderDate: new Date(),
    });

    await newCommande.save();

    // Notification Stripe Webhooks (en production, c'est via webhooks)
    console.log(`✅ Commande créée: ${newCommande._id} - Paiement: ${paymentIntentId}`);

    res.status(201).json({
      success: true,
      orderId: newCommande._id,
      message: 'Commande confirmée',
      paymentId: paymentIntentId
    });

  } catch (error) {
    console.error('Erreur confirmation paiement:', error);
    res.status(500).json({ 
      error: error.message,
      code: 'PAYMENT_CONFIRMATION_FAILED'
    });
  }
};

/**
 * Webhooks Stripe (pour les paiements asynchrones)
 * POST /api/payments/webhook
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, // Important: le body brut, pas JSON parsé
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error('Signature webhook invalide:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Traiter les événements
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('✅ Paiement réussi:', event.data.object.id);
      // Peut être utilisé pour des actions asynchrones
      break;

    case 'payment_intent.payment_failed':
      console.log('❌ Paiement échoué:', event.data.object.id);
      // Notifier l'utilisateur
      break;

    case 'charge.refunded':
      console.log('💱 Remboursement:', event.data.object.id);
      // Mettre à jour la commande
      break;

    default:
      console.log(`Événement non traité: ${event.type}`);
  }

  res.json({ received: true });
};

/**
 * Récupérer l'historique des paiements d'un utilisateur
 * GET /api/payments/history
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user?.id;

    const payments = await Commande.find({ userId })
      .select('_id total status orderDate paymentIntentId')
      .sort({ orderDate: -1 })
      .limit(20);

    res.json(payments);
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({ error: error.message });
  }
};
