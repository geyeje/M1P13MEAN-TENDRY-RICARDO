// Backend Server - Express.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app = express();

// Connexion à la base de données
connectDB();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static('uploads'));

// Routes de base
app.get('/', (req, res) => {
  res.json({
    message: '🏬 API Centre Commercial - MEAN Stack',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      boutiques: '/api/boutiques',
      produits: '/api/produits',
      commandes: '/api/commandes',
    },
  });
});

// Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Import des routes
const authRoutes = require('./routes/auth.routes');
const boutiqueRoutes = require('./routes/boutique.routes');
const adminRoutes = require('./routes/admin.routes');
// const produitRoutes = require('./routes/produit.routes');
// const commandeRoutes = require('./routes/commande.routes');

// Utiliser les routes
app.use('/api/auth', authRoutes);
app.use('/api/boutiques', boutiqueRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/produits', produitRoutes);
// app.use('/api/commandes', commandeRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    message: 'Route non trouvée',
    path: req.originalUrl,
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📝 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📚 Docs API: http://localhost:${PORT}/api/auth`);
});

module.exports = app;
