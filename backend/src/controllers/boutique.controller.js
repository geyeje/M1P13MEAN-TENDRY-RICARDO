const Boutique = require('../models/Boutique');
const User = require ('../models/User');
const {validationResult} = require('express-validator')


//creation d'une boutique

// @desc    Créer une nouvelle boutique
// @route   POST /api/boutiques
// @access  Private (role: boutique)
exports.createBoutique = async (req , res ) => {
  try{
    //validation des donnees
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({
        success:false,
        errors:errors.array()
      });
    }
    //virification si user a un boutique 
    const existingBoutique = await Boutique.findOne({
      userId:req.user.id
    });
    if(existingBoutique){
      return res.status(400).json({
        success:false,
        message:'vous avez deja une boutisue enregistree'
      });
    }
    //extraction de donnee
    const boutique = await Boutique.create({
      name,
      description,
      categorie,
      userId,
      statut:'en_attente',
      phone,
      email,
      adresse,
      schedule,
      socialNetwork,
      logo:req.file ? req.file.path :null
    });
    

    //populer des infos clients 

    await boutique.populate ('userId', 'nom prenom email');

    //reponse
    res.status(201).json({
      success: true,
      message: 'boutique créée avec succes . en attente de validation ',
      boutique
    });
  }catch(error){
    console.error('erreue lors de la creation de boutique:', error);
    res.status(500).json({
      success:false,
      message:'Erreur lors de la creation de la boutique',
      error: error.message
    });
  }
};

///obtenir tout les boutiques
// @desc    Liste toutes les boutiques (avec filtres)
// @route   GET /api/boutiques
// @access  Public

exports.getAllBoutiques= async (req, res) => {
  try{
    //recuperer les parametre de recherche/filtrage
    const{
      categorie,
      statut,
      search,
      page=1,
      limit= 10,
      sort= '-createdAt'
    } = req.query;

    //construire le filtre
    const filter= {};

    //si pas admin montrer seulement les boutiques actices 
    if (req.user?.role !=='admin'){
      filter.statut='active';
    }else if (statut){
      //admin peut filtrer par sstatus 
      filter.statut= statut;
    }

    //filtrer par categories 
    if (categorie){
      filter.categorie=categorie;
    }

    //recherche textuel

    if (search){
      filter.$or = [
        {name:{$regex:search, $options:'i'}},
        {description:{$regex: search , options:'i'}}

      ];
    }

    //calculer la pagination 
    const skip = (page -1) * limit;

    //executer la requete

    const boutiques = await Boutique.find(filter)
      .populate('userId','nom prenom email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);
    //compter la pagination 
    const total = await Boutique.countDocuments(filter);

    //reponse
    res.status(200).json({
      success:true,
      count:boutiques.length,
      total,
      totalPages:Math.ceil(total /limit),
      currentPage: parseInt(page),
      boutiques
    });
  }catch (error){
    console.error('erreur recuperation boutiqes : ', error);
    res.status(500).json({
      success:false,
      message:'erreur lores de la recuperation des coutiques',
      error: error.message
    });
    
  }
}

exports.getBoutiqueById = async (req,res) =>{
  try{
    const boutique = await Boutique.findById(req.params.id)
      .populate('userId','nom prenom email telephone ');
    if (!boutique){
      return res.status(404).json({
        success:false,
        message:'botique non trouvé'
      });
    }
    //si boutique n'est pas acticve , asdmin et prop peut acivé
    if (boutique .statut !=='active'){
      if(!req.user || (req.user.role !== 'admin' && req.user.id !==boutique.userId._id.toString())){
        return res.status(403).json({
          success:false,
          message:'Boutique non accessible'
        });
      }
    }
    res.status(200).json({
      success:true,
      boutique
    });

  }catch(error){
    console.error ('erreur recuperation boutique:' ,error);
    res.status(500).json({
      success:false,
      message:'erreur lors de la recuperation boutique',
      error:error.message
    });
  }
}
// 4. OBTENIR MA BOUTIQUE (Gérant)
// ========================================
// @desc    Récupérer la boutique du gérant connecté
// @route   GET /api/boutiques/me/myboutique
// @access  Private (role: boutique)
exports.getMyBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ userId: req.user.id })
      .populate('userId', 'nom prenom email');

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Vous n\'avez pas encore de boutique enregistrée'
      });
    }

    res.status(200).json({
      success: true,
      boutique
    });

  } catch (error) {
    console.error('Erreur récupération ma boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de votre boutique',
      error: error.message
    });
  }
};

// ========================================
// 5. METTRE À JOUR UNE BOUTIQUE
// ========================================
// @desc    Modifier une boutique
// @route   PUT /api/boutiques/:id
// @access  Private (propriétaire ou admin)
exports.updateBoutique = async (req, res) => {
  try {
    // 1. Trouver la boutique
    let boutique = await Boutique.findById(req.params.id);

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    // 2. Vérifier les permissions
    // Seul le propriétaire ou un admin peut modifier
    if (boutique.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette boutique'
      });
    }

    // 3. Empêcher la modification du statut par le gérant
    if (req.user.role !== 'admin' && req.body.statut) {
      delete req.body.statut;  // Seul l'admin peut changer le statut
    }

    // 4. Mettre à jour
    boutique = await Boutique.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,              // Retourner le document modifié
        runValidators: true     // Appliquer les validations
      }
    ).populate('userId', 'nom prenom email');

    res.status(200).json({
      success: true,
      message: 'Boutique mise à jour avec succès',
      boutique
    });

  } catch (error) {
    console.error('Erreur mise à jour boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la boutique',
      error: error.message
    });
  }
};

// ========================================
// 6. SUPPRIMER UNE BOUTIQUE
// ========================================
// @desc    Supprimer une boutique
// @route   DELETE /api/boutiques/:id
// @access  Private (propriétaire ou admin)
exports.deleteBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    // Vérifier les permissions
    if (boutique.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cette boutique'
      });
    }

    // Supprimer
    await boutique.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Boutique supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la boutique',
      error: error.message
    });
  }
};

// ========================================
// 7. VALIDER UNE BOUTIQUE (Admin uniquement)
// ========================================
// @desc    Valider ou rejeter une boutique
// @route   PUT /api/boutiques/:id/validate
// @access  Private (admin uniquement)
exports.validateBoutique = async (req, res) => {
  try {
    const { statut, motifRejet } = req.body;

    // Validation du statut
    if (!['active', 'suspendue', 'en_attente'].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const boutique = await Boutique.findById(req.params.id)
      .populate('userId', 'nom prenom email');

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    // Mettre à jour le statut
    boutique.statut = statut;
    
    // Si rejet, enregistrer le motif (optionnel: ajouter ce champ au modèle)
    if (statut === 'suspendue' && motifRejet) {
      boutique.motifRejet = motifRejet;
    }

    await boutique.save();

    // TODO: Envoyer une notification au gérant (email, etc.)

    res.status(200).json({
      success: true,
      message: `Boutique ${statut === 'active' ? 'validée' : 'suspendue'} avec succès`,
      boutique
    });

  } catch (error) {
    console.error('Erreur validation boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation de la boutique',
      error: error.message
    });
  }
};

// ========================================
// 8. OBTENIR LES STATISTIQUES (Admin)
// ========================================
// @desc    Statistiques des boutiques
// @route   GET /api/boutiques/stats/overview
// @access  Private (admin uniquement)
exports.getBoutiquesStats = async (req, res) => {
  try {
    // Compter par statut
    const stats = await Boutique.aggregate([
      {
        $group: {
          _id: '$statut',
          count: { $sum: 1 }
        }
      }
    ]);

    // Compter par catégorie
    const categoriesStats = await Boutique.aggregate([
      {
        $match: { statut: 'active' }
      },
      {
        $group: {
          _id: '$categorie',
          count: { $sum: 1 }
        }
      }
    ]);

    // Total
    const total = await Boutique.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        total,
        byStatus: stats,
        byCategory: categoriesStats
      }
    });

  } catch (error) {
    console.error('Erreur stats boutiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};