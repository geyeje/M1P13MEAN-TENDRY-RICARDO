// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// avatar upload configuration
const uploadDir = 'uploads/users';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});
const avatarUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Seules les images sont autorisées'));
  }
});

// Validation pour l'inscription
const registerValidation = [
  body('firstname')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  
  body('lastname')
    .trim()
    .notEmpty().withMessage('Le prénom est requis')
    .isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre'),
  
  body('role')
    .optional()
    .isIn(['admin', 'store', 'customer']).withMessage('Rôle invalide'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Numéro de téléphone invalide (10 chiffres requis)'),
  
  body('address')
    .optional()
    .trim()
];

// Validation pour la connexion
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
];

// Routes publiques
router.post('/register', avatarUpload.single('avatar'), registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Routes protégées (nécessitent un token)
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;