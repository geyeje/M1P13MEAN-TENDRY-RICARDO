# Frontend Dockerfile pour Angular 21

FROM node:22-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer les dépendances (incluant Angular CLI)
RUN npm install

# Copier tous les fichiers du frontend
COPY . .

# Exposer le port 4200
EXPOSE 4200

# Lancer ng serve accessible depuis l'extérieur du container
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--poll", "2000"]
