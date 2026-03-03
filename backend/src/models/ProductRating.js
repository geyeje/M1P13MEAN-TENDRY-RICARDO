// Modèle ProductRating - Mongoose
const mongoose = require('mongoose');

const productRatingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'La note est requise'],
      min: [1, 'La note doit être entre 1 et 5'],
      max: [5, 'La note doit être entre 1 et 5'],
    },
    comment: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index composé pour empêcher les évaluations en double (un utilisateur = une note par produit)
productRatingSchema.index({ userId: 1, productId: 1 }, { unique: true });
productRatingSchema.index({ productId: 1 });

const ProductRating = mongoose.model('ProductRating', productRatingSchema);

module.exports = ProductRating;
