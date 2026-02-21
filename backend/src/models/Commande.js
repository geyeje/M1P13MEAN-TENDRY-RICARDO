// backend/src/models/Commande.js - CHAMPS EN ANGLAIS
const mongoose = require('mongoose');

// Sous-schema pour chaque article commandé
const orderItemSchema = new mongoose.Schema({
  productId: {                    // produitId → productId
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true
  },
  name: {                         // nom → name
    type: String,
    required: true
  },
  quantity: {                     // quantite → quantity
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {                    // prixUnitaire → unitPrice
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {                     // sousTotal → subtotal
    type: Number,
    required: true,
    min: 0
  },
  color: {                        // couleur → color
    type: String,
    default: null
  },
  size: {                         // taille → size
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  }
});

// Sous-schema pour l'historique de statut
const statusHistorySchema = new mongoose.Schema({
  status: {                       // statut → status
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  comment: {                      // commentaire → comment
    type: String,
    default: ''
  }
});

// Schema principal de la commande
const commandeSchema = new mongoose.Schema({
  orderNumber: {                  // numeroCommande → orderNumber
    type: String,
    unique: true,
    required: true
  },
  buyerId: {                      // acheteurId → buyerId
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],       // articles → items

  totalAmount: {                  // montantTotal → totalAmount
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {              // adresseLivraison → shippingAddress
    type: String,
    required: [true, 'L\'adresse de livraison est requise'],
    trim: true
  },
  phone: {                        // telephone → phone
    type: String,
    required: [true, 'Le téléphone est requis'],
    trim: true
  },
  note: {                         // commentaire → note
    type: String,
    default: ''
  },
  status: {                       // statut → status
    type: String,
    enum: [
      'pending',        // en_attente
      'confirmed',      // confirmee
      'processing',     // en_preparation
      'shipped',        // expediee
      'delivered',      // livree
      'cancelled'       // annulee
    ],
    default: 'pending'
  },
  paymentStatus: {                // statutPaiement → paymentStatus
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {                // modePaiement → paymentMethod
    type: String,
    enum: ['cash', 'card', 'mobile', 'transfer'],
    default: 'cash'
  },
  deliveryDate: {                 // dateLivraison → deliveryDate
    type: Date,
    default: null
  },
  statusHistory: [statusHistorySchema]  // historique → statusHistory
}, {
  timestamps: true
});

// Index
commandeSchema.index({ buyerId: 1 });
commandeSchema.index({ status: 1 });
commandeSchema.index({ orderNumber: 1 });
commandeSchema.index({ createdAt: -1 });

const Commande = mongoose.model('Commande', commandeSchema);

module.exports = Commande;