// backend/src/models/Produit.js - CHAMPS EN ANGLAIS
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {                       // note → rating
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {                      // commentaire → comment
    type: String,
    trim: true,
    maxlength: 500
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const produitSchema = new mongoose.Schema({
  name: {                         // nom → name
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
    maxlength: [200, 'Le nom doit contenir maximum 200 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    minlength: [10, 'La description doit contenir au moins 10 caractères']
  },
  price: {                        // prix → price
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  promotionPrice: {
    type: Number,
    default: null,
    min: [0, 'Le prix promo ne peut pas être négatif']
  },
  onSale: {                       // enPromotion → onSale
    type: Boolean,
    default: false
  },
  category: {                     // categorie → category
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: [
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
    ]
  },
  stock: {
    type: Number,
    required: [true, 'Le stock est requis'],
    min: [0, 'Le stock ne peut pas être négatif'],
    default: 0
  },
  brand: {                        // marque → brand
    type: String,
    trim: true
  },
  colors: {                       // couleurs → colors
    type: [String],
    default: []
  },
  sizes: {                        // tailles → sizes
    type: [String],
    default: []
  },
  specs: {                        // caracteristiques → specs
    type: Map,
    of: String,
    default: {}
  },
  tags: {                         // motsCles → tags
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  shopId: {                       // boutiqueId → shopId
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  // Statistiques
  avgRating: {                    // note → avgRating
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {                  // nombreAvis → reviewCount
    type: Number,
    default: 0
  },
  salesCount: {                   // nombreVentes → salesCount
    type: Number,
    default: 0
  },
  viewCount: {                    // vues → viewCount
    type: Number,
    default: 0
  },
  reviews: [reviewSchema]         // avis → reviews
}, {
  timestamps: true
});

// Auto-calculer onSale quand promoPrice est défini
produitSchema.pre('save', function(next) {
  this.onSale = this.promoPrice !== null && this.promoPrice < this.price;
  next();
});

// Index
produitSchema.index({ shopId: 1 });
produitSchema.index({ category: 1 });
produitSchema.index({ price: 1 });
produitSchema.index({ stock: 1 });
produitSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Produit = mongoose.model('Produit', produitSchema);

module.exports = Produit;