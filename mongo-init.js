// Script d'initialisation de MongoDB
// Ce script crée la base de données et un utilisateur admin par défaut

db = db.getSiblingDB('mall_db');

// Créer les collections
db.createCollection('users');
db.createCollection('boutiques');
db.createCollection('produits');
db.createCollection('commandes');

// Créer des index pour optimiser les performances
db.users.createIndex({ email: 1 }, { unique: true });
db.boutiques.createIndex({ userId: 1 });
db.produits.createIndex({ boutiqueId: 1 });
db.commandes.createIndex({ acheteurId: 1 });
db.commandes.createIndex({ boutiqueId: 1 });

// Insérer un utilisateur admin par défaut (mot de passe: Admin123!)
// Note: Le hash bcrypt doit être généré côté backend lors de la vraie création
db.users.insertOne({
  nom: 'Admin',
  prenom: 'Super',
  email: 'admin@mall.com',
  password: '$2a$10$XQZ8QqZ9Q8qZ8QqZ8QqZ8Ou', // À remplacer par un vrai hash
  role: 'admin',
  telephone: '0612345678',
  adresse: '123 Rue du Centre Commercial',
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Base de données mall_db initialisée avec succès !');
print('Collections créées: users, boutiques, produits, commandes');
print('Admin par défaut créé: admin@mall.com');
