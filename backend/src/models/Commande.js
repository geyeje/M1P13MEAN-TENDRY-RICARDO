// backend/src/models/Commande.js - CHAMPS EN ANGLAIS
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true,
  },
  // boutique propriétaire au moment de la commande. Ajouté pour permissions ultérieures
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
  },
  name: String,
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  color: String,
  size: String,
  image: String,
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
  comment: { type: String, default: '' },
});

const commandeSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    // boutiques concernées par la commande (peut contenir plusieurs si panier multi-boutiques)
    shopIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Boutique' }],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    shippingAddress: { type: String, required: true },
    phone: { type: String, required: true },
    note: { type: String, default: '' },
    deliveryDate: Date,
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
commandeSchema.index({ buyerId: 1 });
commandeSchema.index({ status: 1 });
commandeSchema.index({ createdAt: -1 });

const Commande = mongoose.model('Commande', commandeSchema);

module.exports = Commande;
