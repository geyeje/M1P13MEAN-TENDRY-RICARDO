// backend/src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour protéger les routes (vérifier le token JWT)
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Vérifier si le token est dans les headers
    console.log('[Auth Middleware] Headers reçus:', req.headers);
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('[Auth Middleware] Token extrait:', token.substring(0, 20) + '...');
    }

    // Vérifier si le token existe
    if (!token) {
      console.log('[Auth Middleware] Rejet: Token manquant');
      return res.status(401).json({
        success: false,
        message: 'Non autorisé. Token manquant.',
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur depuis la DB
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé',
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur middleware auth:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur d'authentification",
    });
  }
};

// Middleware pour vérifier le rôle de l'utilisateur
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // backend still stores "store" for shop owners; normalize to "boutique"
    if (req.user.role === 'store') {
      req.user.role = 'boutique';    // mutate so subsequent logic/handlers see correct value
    }
    const userRole = req.user.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`,
      });
    }
    next();
  };
};
