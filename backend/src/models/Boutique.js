// Modèle Boutique - Mongoose
const mongoose = require('mongoose');

const boutiqueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la boutique est requis'],
      trim: true,
      minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
      trim: true,
      minlength: [10, 'La description doit contenir au moins 10 caractères'],
    },
    logo: {
      type: String,
      default: null,
    },
    banner: {
      type: String,
      default: null,
    },
    category: {
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
        'Services',
        'Autres',
      ],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['en_attente', 'active', 'suspendue'],
      default: 'en_attente',
    },
    phone: {
      type: String,
      required: [true, 'Le téléphone est requis'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email de contact est requis"],
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "L'adresse est requise"],
      trim: true,
    },
    schedule: {
      lundi: { ouverture: String, fermeture: String, ferme: { type: Boolean, default: false } },
      mardi: { ouverture: String, fermeture: String, ferme: { type: Boolean, default: false } },
      mercredi: { ouverture: String, fermeture: String, ferme: { type: Boolean, default: false } },
      jeudi: { ouverture: String, fermeture: String, ferme: { type: Boolean, default: false } },
      vendredi: { ouverture: String, fermeture: String, ferme: { type: Boolean, default: false } },
      samedi: { ouverture: String, fermeture: String, ferme: { type: Boolean, default: false } },
      dimanche: { ouverture: String, fermeture: String, ferme: { type: Boolean, default: true } },
    },
    // Statistiques
    productCount: {
      type: Number,
      default: 0,
    },
    commandCount: {
      type: Number,
      default: 0,
    },
    CA: {
      type: Number,
      default: 0,
    },
    note: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    // Réseaux sociaux
    socialNetwork: {
      facebook: String,
      instagram: String,
      twitter: String,
      website: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
boutiqueSchema.index({ userId: 1 });
boutiqueSchema.index({ category: 1 });
boutiqueSchema.index({ status: 1 });
boutiqueSchema.index({ name: 'text', description: 'text' }); // Recherche textuelle

const Boutique = mongoose.model('Boutique', boutiqueSchema);

module.exports = Boutique;
