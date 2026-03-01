// backend/src/controllers/produit.controller.js - CHAMPS EN ANGLAIS
const Produit = require('../models/Produit');
const Boutique = require('../models/Boutique');
const { validationResult } = require('express-validator');

// ========================================
// 1. CRÉER UN PRODUIT
// ========================================
exports.createProduit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Vérifier que le gérant a une boutique active
    const boutique = await Boutique.findOne({ userId: req.user.id });
    if (!boutique) {
      return res.status(200).json({
        success: false,
        noShop: true,
        message: "Vous devez d'abord créer une boutique",
      });
    }
    if (boutique.status !== 'active') {
      // Matching schema field name
      return res.status(403).json({
        success: false,
        message: 'Votre boutique doit être validée pour ajouter des produits',
      });
    }

    const {
      name,
      description,
      price,
      promoPrice,
      category,
      stock,
      brand,
      colors,
      sizes,
      specs,
      tags,
    } = req.body;

    // Gérer les images uploadées
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/products/${file.filename}`);
    }

    // Parser les tableaux - accepte: Array natif, JSON string, string virgule-séparée
    const parseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.filter(Boolean);
      if (typeof val === 'string') {
        // Try JSON first
        if (val.trim().startsWith('[')) {
          try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
          } catch (e) {
            console.error('Erreur parsing array:', e.message);
            return [];
          }
        }
        // Comma-separated fallback
        return val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    };

    // const parsedColors = parseArray(req.body['colors[]'] || colors);
    // const parsedSizes = parseArray(req.body['sizes[]'] || sizes);
    // const parsedTags = parseArray(req.body['tags[]'] || tags);

    const parsedColors = parseArray(colors);
    const parsedSizes = parseArray(sizes);
    const parsedTags = parseArray(tags);

    console.log('🎨 Colors:', parsedColors);
    console.log('📏 Sizes:', parsedSizes);
    console.log('🏷️ Tags:', parsedTags);

    // Specs: JSON object ou string
    let parsedSpecs = {};
    if (specs) {
      if (typeof specs === 'string') {
        try {
          parsedSpecs = JSON.parse(specs);
        } catch {
          parsedSpecs = { note: specs };
        }
      } else {
        parsedSpecs = specs;
      }
    }

    const produit = await Produit.create({
      name,
      description,
      price,
      promoPrice: promoPrice || null,
      category,
      stock,
      brand,
      colors: parsedColors,
      sizes: parsedSizes,
      specs: parsedSpecs,
      tags: parsedTags,
      images,
      shopId: boutique._id,
    });

    // Incrémenter le compteur de produits de la boutique
    boutique.productCount += 1;
    await boutique.save();

    await produit.populate('shopId', 'name logo');

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      produit,
    });
  } catch (error) {
    console.error('Erreur création produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du produit',
      error: error.message,
    });
  }
};

// ========================================
// 2. LISTE DES PRODUITS (avec filtres)
// ========================================
exports.getAllProduits = async (req, res) => {
  try {
    const {
      category,
      shop,
      priceMin,
      priceMax,
      onSale,
      inStock,
      search,
      brand,
      color,
      size,
      sort = '-createdAt',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (shop) filter.shopId = shop;
    if (brand) filter.brand = brand;
    if (color) filter.colors = { $in: [color] };
    if (size) filter.sizes = { $in: [size] };
    if (onSale === 'true') filter.onSale = true;
    if (inStock === 'true') filter.stock = { $gt: 0 };

    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = parseFloat(priceMin);
      if (priceMax) filter.price.$lte = parseFloat(priceMax);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (page - 1) * limit;

    const produits = await Produit.find(filter)
      .populate('shopId', 'name logo')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Produit.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: produits.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      produits,
    });
  } catch (error) {
    console.error('Erreur récupération produits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits',
      error: error.message,
    });
  }
};

// ========================================
// 3. DÉTAILS D'UN PRODUIT
// ========================================
exports.getProduitById = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id)
      .populate('shopId', 'name logo adresse phone email')
      .populate('reviews.userId', 'nom prenom');

    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    // Incrémenter les vues
    produit.viewCount += 1;
    await produit.save();

    res.status(200).json({ success: true, produit });
  } catch (error) {
    console.error('Erreur récupération produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit',
      error: error.message,
    });
  }
};

// ========================================
// 4. MES PRODUITS (Gérant)
// ========================================
exports.getMyProduits = async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ userId: req.user.id });
    if (!boutique) {
      return res.status(200).json({
        success: false,
        noShop: true,
        message: 'Boutique non trouvée',
      });
    }

    const produits = await Produit.find({ shopId: boutique._id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: produits.length,
      produits,
    });
  } catch (error) {
    console.error('Erreur récupération mes produits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos produits',
      error: error.message,
    });
  }
};

// ========================================
// 5. MODIFIER UN PRODUIT
// ========================================
exports.updateProduit = async (req, res) => {
  try {
    let produit = await Produit.findById(req.params.id);
    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    // Vérifier permissions
    const boutique = await Boutique.findById(produit.shopId);
    if (boutique.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    // Gérer les images :
    // - existingImages[] : URLs des images déjà en BDD que l'utilisateur veut conserver
    // - req.files      : nouveaux fichiers uploadés
    let finalImages = [];

    // Images existantes à conserver (envoyées par le frontend)
    if (req.body['existingImages[]']) {
      const existing = req.body['existingImages[]'];
      finalImages = Array.isArray(existing) ? existing : [existing];
    } else if (req.body.existingImages) {
      const existing = req.body.existingImages;
      finalImages = Array.isArray(existing) ? existing : [existing];
    } else {
      // Si le frontend n'envoie rien pour existingImages, conserver les anciennes (comportement legacy)
      finalImages = [...(produit.images || [])];
    }

    // Ajouter les nouvelles images uploadées
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/products/${file.filename}`);
      console.log('📷 Nouvelles images:', newImages);
      finalImages = [...finalImages, ...newImages];
    }

    // Limiter à 5 images max
    finalImages = finalImages.slice(0, 5);
    req.body.images = finalImages;

    // Parser les tableaux - accepte: Array natif, JSON string, string virgule-séparée
    const parseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.filter(Boolean);
      if (typeof val === 'string') {
        // Try JSON first
        if (val.trim().startsWith('[')) {
          try {
            return JSON.parse(val);
          } catch {}
        }
        // Comma-separated fallback
        return val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    };

    if (req.body.colors || req.body['colors[]'])
      req.body.colors = parseArray(req.body['colors[]'] || req.body.colors);
    if (req.body.sizes || req.body['sizes[]'])
      req.body.sizes = parseArray(req.body['sizes[]'] || req.body.sizes);
    if (req.body.tags || req.body['tags[]'])
      req.body.tags = parseArray(req.body['tags[]'] || req.body.tags);

    // Convert empty strings to null/proper types
    if (req.body.promoPrice === '') req.body.promoPrice = null;
    if (req.body.price === '') delete req.body.price; // keep existing if invalid
    if (req.body.stock === '') delete req.body.stock; // keep existing if invalid

    // Specs: JSON object ou string
    if (req.body.specs && typeof req.body.specs === 'string') {
      try {
        req.body.specs = JSON.parse(req.body.specs);
      } catch {
        // Garder tel quel ou mettre dans une note si c'est pas du JSON
      }
    }

    produit = await Produit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('shopId', 'name logo');

    res.status(200).json({
      success: true,
      message: 'Produit mis à jour avec succès',
      produit,
    });
  } catch (error) {
    console.error('Erreur mise à jour produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du produit',
      error: error.message,
    });
  }
};

// ========================================
// 6. SUPPRIMER UN PRODUIT
// ========================================
exports.deleteProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    const boutique = await Boutique.findById(produit.shopId);
    if (boutique.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    await produit.deleteOne();

    boutique.productCount = Math.max(0, (boutique.productCount || 0) - 1);
    await boutique.save();

    res.status(200).json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du produit',
      error: error.message,
    });
  }
};

// ========================================
// 7. AJOUTER UN AVIS
// ========================================
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const produit = await Produit.findById(req.params.id);
    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    // Vérifier si déjà un avis
    const alreadyReviewed = produit.reviews.find((r) => r.userId.toString() === req.user.id);
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà laissé un avis sur ce produit',
      });
    }

    produit.reviews.push({ userId: req.user.id, rating, comment });

    // Recalculer la moyenne
    const total = produit.reviews.reduce((acc, r) => acc + r.rating, 0);
    produit.avgRating = total / produit.reviews.length;
    produit.reviewCount = produit.reviews.length;

    await produit.save();
    await produit.populate('reviews.userId', 'nom prenom');

    res.status(201).json({
      success: true,
      message: 'Avis ajouté avec succès',
      produit,
    });
  } catch (error) {
    console.error('Erreur ajout avis:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'ajout de l'avis",
      error: error.message,
    });
  }
};

// ========================================
// 8. METTRE À JOUR LE STOCK
// ========================================
exports.updateStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body;

    const produit = await Produit.findById(req.params.id);
    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    const boutique = await Boutique.findById(produit.shopId);
    if (boutique.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    if (operation === 'add') {
      produit.stock += quantity;
    } else if (operation === 'subtract') {
      produit.stock = Math.max(0, produit.stock - quantity);
    } else {
      produit.stock = quantity;
    }

    await produit.save();

    res.status(200).json({
      success: true,
      message: 'Stock mis à jour',
      stock: produit.stock,
    });
  } catch (error) {
    console.error('Erreur stock:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du stock',
      error: error.message,
    });
  }
};
