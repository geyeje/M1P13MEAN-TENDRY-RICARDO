// Modèle Produit - Mongoose
const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    minlength: [3, 'Le nom doit contenir au moins 3 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    minlength: [10, 'La description doit contenir au moins 10 caractères']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  promotionPrice: {
    type: Number,
    default: null,
    min: [0, 'Le prix promo ne peut pas être négatif']
  },
  images: [{
    type: String
  }],
  mainImage: {
    type: String,
    default: null
  },
  stock: {
    type: Number,
    required: [true, 'Le stock est requis'],
    min: [0, 'Le stock ne peut pas être négatif'],
    default: 0
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise']
  },
  subCategory: {
    type: String,
    default: null
  },
  brand: {
    type: String,
    trim: true
  },
  // Caractéristiques techniques (flexible)
  characteristics: {
    type: Map,
    of: String
  },
  // Tailles disponibles (pour vêtements)
  size: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique']
  }],
  // Couleurs disponibles
  colors: [String],
  // Promotion
  specialOffert: {
    type: Boolean,
    default: false
  },
  reductionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Disponibilité
  isOnSale: {
    type: Boolean,
    default: true
  },
  // Statistiques
  saleAmount: {
    type: Number,
    default: 0
  },
  review: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewNumber: {
    type: Number,
    default: 0
  },
  // Mise en avant
  featured: {
    type: Boolean,
    default: false
  },
  novelty: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtuel pour calculer le prix final
produitSchema.virtual('prixFinal').get(function() {
  if (this.specialOffert && this.promotionPrice) {
    return this.promotionPrice;
  }
  if (this.promotionPrice && this.reductionPercentage > 0) {
    return this.price - (this.price * this.reductionPercentage / 100);
  }
  return this.price;
});

// S'assurer que les virtuels sont inclus dans JSON
produitSchema.set('toJSON', { virtuals: true });
produitSchema.set('toObject', { virtuals: true });

// Index pour améliorer les performances
produitSchema.index({ storeId: 1 });
produitSchema.index({ category: 1 });
produitSchema.index({ price: 1 });
produitSchema.index({ review: -1 });
produitSchema.index({ saleAmount: -1 });
produitSchema.index({ name: 'text', description: 'text' }); // Recherche textuelle

const Produit = mongoose.model('Produit', produitSchema);

module.exports = Produit;
