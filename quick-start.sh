#!/bin/bash

# Script d'installation et de démarrage rapide du projet
# Utilisation : chmod +x quick-start.sh && ./quick-start.sh

echo "🏬 Installation du Projet Centre Commercial MEAN Stack"
echo "======================================================"
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null
then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null
then
    echo "⚠️  Docker n'est pas installé. Certaines fonctionnalités ne seront pas disponibles."
    echo "   Téléchargez Docker depuis https://www.docker.com/get-started"
fi

echo "✅ Node.js $(node --version) détecté"
echo ""

# Créer la structure de base si elle n'existe pas
echo "📁 Création de la structure du projet..."
mkdir -p backend/src/{config,models,routes,controllers,middlewares,utils}
mkdir -p backend/uploads
mkdir -p frontend

echo "✅ Structure créée"
echo ""

# Backend
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installation des dépendances backend..."
    cd backend
    npm install
    cd ..
    echo "✅ Dépendances backend installées"
else
    echo "✅ Dépendances backend déjà installées"
fi

# Frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installation des dépendances frontend..."
    cd frontend
    npm install
    cd ..
    echo "✅ Dépendances frontend installées"
else
    echo "✅ Dépendances frontend déjà installées"
fi

echo ""
echo "🔧 Configuration..."

# Créer .env si n'existe pas
if [ ! -f "backend/.env" ]; then
    echo "📝 Création du fichier .env..."
    cp backend/.env.example backend/.env
    echo "⚠️  N'oubliez pas de configurer votre fichier backend/.env"
fi

echo ""
echo "✅ Installation terminée !"
echo ""
echo "🚀 Pour démarrer le projet :"
echo ""
echo "   Option 1 - Avec Docker (recommandé) :"
echo "   $ docker-compose up -d"
echo ""
echo "   Option 2 - Sans Docker :"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm start"
echo ""
echo "📝 Accès aux services :"
echo "   Frontend:  http://localhost:4200"
echo "   Backend:   http://localhost:5000"
echo "   MongoDB:   localhost:27017"
echo ""
echo "📚 Consultez README.md pour plus d'informations"
echo ""
