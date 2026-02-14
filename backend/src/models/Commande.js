// Modèle Commande - Mongoose
const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
  orderCount: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  product: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true
    },
    name: String,
    price: Number,
    productCount: {
      type: Number,
      required: true,
      min: [1, 'La quantité doit être au moins 1']
    },
    size: String,
    color: String,
    image: String
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  subTotalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryAmount: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  promoCode: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'repairing',
      'lent',
      'shipped',
      'delivered',
      'canceled',
      'refunded'
    ],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'mobile_money', 'cash', 'wire_transfer'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: null
  },
  deliveryAddress: {
    nom: String,
    prenom: String,
    telephone: String,
    adresse: String,
    ville: String,
    codePostal: String,
    instructions: String
  },
  tracking: [{
    status: String,
    date: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  notes: {
    type: String,
    default: null
  },
  expeditionDate: {
    type: Date,
    default: null
  },
  deliveryDate: {
    type: Date,
    default: null
  },
  // Avis client
  review: {
    note: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: Date
  }
}, {
  timestamps: true
});

// Middleware pour générer un numéro de commande unique
commandeSchema.pre('save', async function(next) {
  if (!this.orderCount) {
    const count = await this.constructor.countDocuments();
    this.orderCount = `CMD${Date.now()}${count + 1}`;
  }
  next();
});

// Méthode pour ajouter un tracking
commandeSchema.methods.ajouterTracking = function(status, description) {
  this.tracking.push({
    status,
    description,
    date: new Date()
  });
  this.status = status;
  return this.save();
};

// Index pour améliorer les performances
commandeSchema.index({ customerId: 1 });
commandeSchema.index({ storeId: 1 });
commandeSchema.index({ orderCount: 1 });
commandeSchema.index({ status: 1 });
commandeSchema.index({ createdAt: -1 });

const Commande = mongoose.model('Commande', commandeSchema);

module.exports = Commande;
