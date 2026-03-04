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
// Configure CORS
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: true,
  })
);

// Gestion explicite des requêtes OPTIONS (preflight CORS)
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Normaliser les URLs avec des double-slashes (ex: /api//produits -> /api/produits)
app.use((req, res, next) => {
  if (req.path.includes('//')) {
    const cleanPath = req.path.replace(/\/\/+/g, '/');
    const cleanUrl = cleanPath + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
    console.warn(`[URL Normalization] Redirecting: ${req.url} -> ${cleanUrl}`);
    return res.redirect(301, cleanUrl);
  }
  next();
});

// Import des routes
const authRoutes = require('./routes/auth.routes');
const boutiqueRoutes = require('./routes/boutique.routes');
const adminRoutes = require('./routes/admin.routes');
const produitRoutes = require('./routes/produit.routes');
const commandeRoutes = require('./routes/commande.routes');
const paymentRoutes = require('./routes/payment.routes');
const settingsRoutes = require('./routes/settings.routes');

// Utiliser les routes
app.use('/api/auth', authRoutes);
app.use('/api/boutiques', boutiqueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);

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
  // Ajouter les headers CORS même en cas d'erreur
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.status(err.status || 500).json({
    message: err.message || 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(` Serveur démarré sur le port ${PORT}`);
  console.log(` Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(`g Docs API: http://localhost:${PORT}/api/auth`);
});

module.exports = app;
