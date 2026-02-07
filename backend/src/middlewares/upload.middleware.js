// backend/src/middlewares/upload.middleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, '../../uploads/boutiques');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ========================================
// CONFIGURATION DU STOCKAGE
// ========================================

const storage = multer.diskStorage({
  // Destination des fichiers
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  
  // Nom du fichier
  filename: function (req, file, cb) {
    // Format: boutique-userId-timestamp.extension
    // Exemple: boutique-64abc123-1704196800000.jpg
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `boutique-${req.user.id}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// ========================================
// FILTRAGE DES FICHIERS
// ========================================

const fileFilter = (req, file, cb) => {
  // Types MIME autorisés pour les images
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);  // Accepter le fichier
  } else {
    cb(new Error('Format de fichier non autorisé. Utilisez JPG, PNG ou WEBP'), false);
  }
};

// ========================================
// CONFIGURATION MULTER
// ========================================

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5 MB max
  }
});

// ========================================
// GESTION DES ERREURS MULTER
// ========================================

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Erreurs Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux. Maximum 5 MB.'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Nombre de fichiers dépassé'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'Erreur lors de l\'upload',
      error: err.message
    });
  }
  
  if (err) {
    // Autres erreurs (fileFilter, etc.)
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

module.exports = upload;
module.exports.handleMulterError = handleMulterError;