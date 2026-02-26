// Configuration de la connexion MongoDB
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URI2;
  if (!uri) {
    console.error('❌ Aucune URI MongoDB fournie dans les variables d\'environnement');
    process.exit(1);
  }

  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // nombre de tentatives de reconnexion
      retryWrites: true,
      serverSelectionTimeoutMS: 5000,       // fail fast if URI is wrong / unreachable
      socketTimeoutMS: 45000,
    };

    console.log('📡 Tentative de connexion à MongoDB avec', uri);
    const conn = await mongoose.connect(uri, options);

    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);

    // Événements de connexion
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB déconnecté - tentative de reconnexion');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔁 MongoDB reconnecté');
    });

    // Fermeture propre de la connexion
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 Connexion MongoDB fermée');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    // on affiche la stack complète pour diagnostiquer
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
};

module.exports = connectDB;
