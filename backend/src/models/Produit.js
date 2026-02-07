// Modèle Produit - Mongoose
const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  nom: {
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
  prix: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  prixPromo: {
    type: Number,
    default: null,
    min: [0, 'Le prix promo ne peut pas être négatif']
  },
  images: [{
    type: String
  }],
  imagePrincipale: {
    type: String,
    default: null
  },
  stock: {
    type: Number,
    required: [true, 'Le stock est requis'],
    min: [0, 'Le stock ne peut pas être négatif'],
    default: 0
  },
  boutiqueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  categorie: {
    type: String,
    required: [true, 'La catégorie est requise']
  },
  sousCategorie: {
    type: String,
    default: null
  },
  marque: {
    type: String,
    trim: true
  },
  // Caractéristiques techniques (flexible)
  caracteristiques: {
    type: Map,
    of: String
  },
  // Tailles disponibles (pour vêtements)
  tailles: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique']
  }],
  // Couleurs disponibles
  couleurs: [String],
  // Promotion
  enPromotion: {
    type: Boolean,
    default: false
  },
  pourcentageReduction: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Disponibilité
  disponible: {
    type: Boolean,
    default: true
  },
  // Statistiques
  nombreVentes: {
    type: Number,
    default: 0
  },
  note: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  nombreAvis: {
    type: Number,
    default: 0
  },
  // Mise en avant
  featured: {
    type: Boolean,
    default: false
  },
  nouveaute: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtuel pour calculer le prix final
produitSchema.virtual('prixFinal').get(function() {
  if (this.enPromotion && this.prixPromo) {
    return this.prixPromo;
  }
  if (this.enPromotion && this.pourcentageReduction > 0) {
    return this.prix - (this.prix * this.pourcentageReduction / 100);
  }
  return this.prix;
});

// S'assurer que les virtuels sont inclus dans JSON
produitSchema.set('toJSON', { virtuals: true });
produitSchema.set('toObject', { virtuals: true });

// Index pour améliorer les performances
produitSchema.index({ boutiqueId: 1 });
produitSchema.index({ categorie: 1 });
produitSchema.index({ prix: 1 });
produitSchema.index({ note: -1 });
produitSchema.index({ nombreVentes: -1 });
produitSchema.index({ nom: 'text', description: 'text' }); // Recherche textuelle

const Produit = mongoose.model('Produit', produitSchema);

module.exports = Produit;
