const Produit = require('../models/Produit');
const User = require ('../models/User');
const Boutique = require ('../models/Boutique');
const { validationResult} = require('express-validator');


exports.createProduit = async (req,res) => {
  try{
    const errors = validationResult(req);
    if(!errors.isEmpty){
      return res.status(400).json({
        success:false,
        errors:errors.array()
      });

    }
    const boutique = await Boutique.findOne({userId:req.user.id});
    if(!boutique){
      return res.status(404).json({
        sucess:false,
        message:'Vous devez d\'abord créer une boutique'
      });
    }
    if (boutique .statut !=='active'){
      return res.status(404).json({
        success:false,
        message:'Votre boutique doit être validée pour ajouter des produits'
      });
    }
    // Extraire les données
    const {
      nom,
      description,
      prix,
      prixPromo,
      categorie,
      stock,
      marque,
      couleurs,
      tailles,
      caracteristiques,
      motsCles
    } = req.body;
     // Gérer les images (upload multiple)
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }

    // Créer le produit
    const produit = await Produit.create({
      nom,
      description,
      prix,
      prixPromo,
      categorie,
      stock,
      marque,
      couleurs: couleurs ? JSON.parse(couleurs) : [],
      tailles: tailles ? JSON.parse(tailles) : [],
      caracteristiques: caracteristiques ? JSON.parse(caracteristiques) : {},
      motsCles: motsCles ? JSON.parse(motsCles) : [],
      images,
      boutiqueId: boutique._id
    });

    // Mettre à jour le nombre de produits dans la boutique
    boutique.nombreProduits += 1;
    await boutique.save();

    // Populate la boutique
    await produit.populate('boutiqueId', 'nom logo');

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      produit
    });


  }catch(error){
    console.error('Erreur création produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du produit',
      error: error.message
    });
  }
};

// @desc    Liste des produits avec filtres avancés
// @route   GET /api/produits
// @access  Public
exports.getAllProduits = async (req, res) => {
  try {
    const {
      categorie,
      boutique,
      prixMin,
      prixMax,
      enPromo,
      enStock,
      search,
      marque,
      couleur,
      taille,
      sort = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;

    // Construction du filtre
    const filter = {};

    // Filtrer par catégorie
    if (categorie) {
      filter.categorie = categorie;
    }

    // Filtrer par boutique
    if (boutique) {
      filter.boutiqueId = boutique;
    }

    // Filtrer par prix
    if (prixMin || prixMax) {
      filter.prix = {};
      if (prixMin) filter.prix.$gte = parseFloat(prixMin);
      if (prixMax) filter.prix.$lte = parseFloat(prixMax);
    }

    // Produits en promotion
    if (enPromo === 'true') {
      filter.enPromotion = true;
    }

    // Produits en stock
    if (enStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // Filtrer par marque
    if (marque) {
      filter.marque = marque;
    }

    // Filtrer par couleur
    if (couleur) {
      filter.couleurs = { $in: [couleur] };
    }

    // Filtrer par taille
    if (taille) {
      filter.tailles = { $in: [taille] };
    }

    // Recherche textuelle
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { marque: { $regex: search, $options: 'i' } },
        { motsCles: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Exécuter la requête
    const produits = await Produit.find(filter)
      .populate('boutiqueId', 'nom logo')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Total pour pagination
    const total = await Produit.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: produits.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      produits
    });

  } catch (error) {
    console.error('Erreur récupération produits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits',
      error: error.message
    });
  }
};

// ========================================
// 3. OBTENIR UN PRODUIT PAR ID
// ========================================
// @desc    Détails d'un produit
// @route   GET /api/produits/:id
// @access  Public
exports.getProduitById = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id)
      .populate('boutiqueId', 'nom logo adresse telephone email')
      .populate('avis.userId', 'nom prenom avatar');

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Incrémenter les vues
    produit.vues += 1;
    await produit.save();

    res.status(200).json({
      success: true,
      produit
    });

  } catch (error) {
    console.error('Erreur récupération produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit',
      error: error.message
    });
  }
};

// ========================================
// 4. OBTENIR MES PRODUITS (Gérant)
// ========================================
// @desc    Produits de ma boutique
// @route   GET /api/produits/me/myproduits
// @access  Private (role: boutique)
exports.getMyProduits = async (req, res) => {
  try {
    // Trouver la boutique du gérant
    const boutique = await Boutique.findOne({ userId: req.user.id });
    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    // Récupérer tous les produits de cette boutique
    const produits = await Produit.find({ boutiqueId: boutique._id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: produits.length,
      produits
    });

  } catch (error) {
    console.error('Erreur récupération mes produits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos produits',
      error: error.message
    });
  }
};

// ========================================
// 5. METTRE À JOUR UN PRODUIT
// ========================================
// @desc    Modifier un produit
// @route   PUT /api/produits/:id
// @access  Private (propriétaire ou admin)
exports.updateProduit = async (req, res) => {
  try {
    let produit = await Produit.findById(req.params.id);

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Vérifier les permissions
    const boutique = await Boutique.findById(produit.boutiqueId);
    if (boutique.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce produit'
      });
    }

    // Gérer les nouvelles images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      req.body.images = [...(produit.images || []), ...newImages];
    }

    // Parser les champs JSON si présents
    if (req.body.couleurs && typeof req.body.couleurs === 'string') {
      req.body.couleurs = JSON.parse(req.body.couleurs);
    }
    if (req.body.tailles && typeof req.body.tailles === 'string') {
      req.body.tailles = JSON.parse(req.body.tailles);
    }
    if (req.body.caracteristiques && typeof req.body.caracteristiques === 'string') {
      req.body.caracteristiques = JSON.parse(req.body.caracteristiques);
    }

    // Mettre à jour
    produit = await Produit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('boutiqueId', 'nom logo');

    res.status(200).json({
      success: true,
      message: 'Produit mis à jour avec succès',
      produit
    });

  } catch (error) {
    console.error('Erreur mise à jour produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du produit',
      error: error.message
    });
  }
};

// ========================================
// 6. SUPPRIMER UN PRODUIT
// ========================================
// @desc    Supprimer un produit
// @route   DELETE /api/produits/:id
// @access  Private (propriétaire ou admin)
exports.deleteProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Vérifier les permissions
    const boutique = await Boutique.findById(produit.boutiqueId);
    if (boutique.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer ce produit'
      });
    }

    await produit.deleteOne();

    // Décrémenter le nombre de produits dans la boutique
    boutique.nombreProduits = Math.max(0, boutique.nombreProduits - 1);
    await boutique.save();

    res.status(200).json({
      success: true,
      message: 'Produit supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du produit',
      error: error.message
    });
  }
};

// ========================================
// 7. AJOUTER UN AVIS
// ========================================
// @desc    Ajouter un avis sur un produit
// @route   POST /api/produits/:id/avis
// @access  Private (acheteur qui a commandé)
exports.addAvis = async (req, res) => {
  try {
    const { note, commentaire } = req.body;

    const produit = await Produit.findById(req.params.id);

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Vérifier si l'utilisateur a déjà laissé un avis
    const dejaAvis = produit.avis.find(
      avis => avis.userId.toString() === req.user.id
    );

    if (dejaAvis) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà laissé un avis sur ce produit'
      });
    }

    // TODO: Vérifier que l'utilisateur a bien commandé ce produit

    // Ajouter l'avis
    produit.avis.push({
      userId: req.user.id,
      note,
      commentaire
    });

    // Recalculer la note moyenne
    const totalNotes = produit.avis.reduce((acc, avis) => acc + avis.note, 0);
    produit.note = totalNotes / produit.avis.length;
    produit.nombreAvis = produit.avis.length;

    await produit.save();

    await produit.populate('avis.userId', 'nom prenom avatar');

    res.status(201).json({
      success: true,
      message: 'Avis ajouté avec succès',
      produit
    });

  } catch (error) {
    console.error('Erreur ajout avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'avis',
      error: error.message
    });
  }
};

// ========================================
// 8. METTRE À JOUR LE STOCK
// ========================================
// @desc    Modifier le stock d'un produit
// @route   PATCH /api/produits/:id/stock
// @access  Private (propriétaire ou admin)
exports.updateStock = async (req, res) => {
  try {
    const { quantite, operation } = req.body; // operation: 'add' ou 'subtract'

    const produit = await Produit.findById(req.params.id);

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Vérifier les permissions
    const boutique = await Boutique.findById(produit.boutiqueId);
    if (boutique.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    // Modifier le stock
    if (operation === 'add') {
      produit.stock += quantite;
    } else if (operation === 'subtract') {
      produit.stock = Math.max(0, produit.stock - quantite);
    } else {
      produit.stock = quantite; // Définir directement
    }

    await produit.save();

    res.status(200).json({
      success: true,
      message: 'Stock mis à jour',
      stock: produit.stock
    });

  } catch (error) {
    console.error('Erreur mise à jour stock:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du stock',
      error: error.message
    });
  }
};

// ========================================
// 9. STATISTIQUES PRODUITS (Admin)
// ========================================
// @desc    Statistiques des produits
// @route   GET /api/produits/stats/overview
// @access  Private (admin)
exports.getProduitsStats = async (req, res) => {
  try {
    const total = await Produit.countDocuments();
    const enStock = await Produit.countDocuments({ stock: { $gt: 0 } });
    const enRupture = await Produit.countDocuments({ stock: 0 });
    const enPromo = await Produit.countDocuments({ enPromotion: true });

    // Produits par catégorie
    const parCategorie = await Produit.aggregate([
      {
        $group: {
          _id: '$categorie',
          count: { $sum: 1 }
        }
      }
    ]);

    // Produits les plus vus
    const plusVus = await Produit.find()
      .sort('-vues')
      .limit(10)
      .select('nom vues images')
      .populate('boutiqueId', 'nom');

    // Prix moyen
    const prixMoyen = await Produit.aggregate([
      {
        $group: {
          _id: null,
          moyenne: { $avg: '$prix' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        enStock,
        enRupture,
        enPromo,
        parCategorie,
        prixMoyen: prixMoyen[0]?.moyenne || 0,
        plusVus
      }
    });

  } catch (error) {
    console.error('Erreur stats produits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};
