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

// Middleware optionnel : décode le token si présent mais n'impose pas son existence
exports.optionalProtect = async (req, res, next) => {
  try {
    console.log('[optionalProtect] authorization header:', req.headers.authorization);
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
        console.log('[optionalProtect] user set:', user._id.toString());
      }
    }
  } catch (err) {
    // ignore errors, on ne fais rien si le token est invalide/expiré
    console.warn('[Auth Middleware] optionalProtect ignore token error:', err.message);
  }
  next();
};

// Middleware pour vérifier le rôle de l'utilisateur
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Normalize legacy role names
    if (req.user.role === 'boutique') {
      req.user.role = 'store';
    }
    if (req.user.role === 'acheteur') {
      req.user.role = 'customer';
    }
    const userRole = req.user.role;

    // L'admin a toujours accès à toutes les routes protégées
    if (userRole === 'admin') {
      return next();
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`,
      });
    }
    next();
  };
};
