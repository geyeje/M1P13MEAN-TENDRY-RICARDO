// Modèle Rating - Mongoose
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    boutiqueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Boutique',
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

// Index composé pour empêcher les évaluations en double (un utilisateur = une note par boutique)
ratingSchema.index({ userId: 1, boutiqueId: 1 }, { unique: true });
ratingSchema.index({ boutiqueId: 1 });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
