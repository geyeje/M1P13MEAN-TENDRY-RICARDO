# Backend Dockerfile pour Express.js

FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tous les fichiers du backend
COPY . .

# Créer le dossier uploads s'il n'existe pas
RUN mkdir -p uploads

# Exposer le port 5000
EXPOSE 5000

# Commande pour démarrer l'application en mode développement
CMD ["npm", "run", "dev"]
