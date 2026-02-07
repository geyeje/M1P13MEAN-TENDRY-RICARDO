// Modèle Commande - Mongoose
const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
  numeroCommande: {
    type: String,
    required: true,
    unique: true
  },
  acheteurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  boutiqueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  produits: [{
    produitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true
    },
    nom: String,
    prix: Number,
    quantite: {
      type: Number,
      required: true,
      min: [1, 'La quantité doit être au moins 1']
    },
    taille: String,
    couleur: String,
    image: String
  }],
  montantTotal: {
    type: Number,
    required: true,
    min: 0
  },
  montantSousTotal: {
    type: Number,
    required: true,
    min: 0
  },
  fraisLivraison: {
    type: Number,
    default: 0
  },
  remise: {
    type: Number,
    default: 0
  },
  codePromo: {
    type: String,
    default: null
  },
  statut: {
    type: String,
    enum: [
      'en_attente',
      'confirmee',
      'en_preparation',
      'prete',
      'en_livraison',
      'livree',
      'annulee',
      'remboursee'
    ],
    default: 'en_attente'
  },
  modePaiement: {
    type: String,
    enum: ['carte_bancaire', 'mobile_money', 'especes', 'virement'],
    required: true
  },
  statutPaiement: {
    type: String,
    enum: ['en_attente', 'paye', 'echoue', 'rembourse'],
    default: 'en_attente'
  },
  transactionId: {
    type: String,
    default: null
  },
  adresseLivraison: {
    nom: String,
    prenom: String,
    telephone: String,
    adresse: String,
    ville: String,
    codePostal: String,
    instructions: String
  },
  tracking: [{
    statut: String,
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
  dateExpedition: {
    type: Date,
    default: null
  },
  dateLivraison: {
    type: Date,
    default: null
  },
  // Avis client
  avis: {
    note: {
      type: Number,
      min: 1,
      max: 5
    },
    commentaire: String,
    date: Date
  }
}, {
  timestamps: true
});

// Middleware pour générer un numéro de commande unique
commandeSchema.pre('save', async function(next) {
  if (!this.numeroCommande) {
    const count = await this.constructor.countDocuments();
    this.numeroCommande = `CMD${Date.now()}${count + 1}`;
  }
  next();
});

// Méthode pour ajouter un tracking
commandeSchema.methods.ajouterTracking = function(statut, description) {
  this.tracking.push({
    statut,
    description,
    date: new Date()
  });
  this.statut = statut;
  return this.save();
};

// Index pour améliorer les performances
commandeSchema.index({ acheteurId: 1 });
commandeSchema.index({ boutiqueId: 1 });
commandeSchema.index({ numeroCommande: 1 });
commandeSchema.index({ statut: 1 });
commandeSchema.index({ createdAt: -1 });

const Commande = mongoose.model('Commande', commandeSchema);

module.exports = Commande;
