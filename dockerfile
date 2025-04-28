# Utilise une image officielle Node.js
FROM node:18

# Crée un répertoire de travail
WORKDIR /app

# Copie les fichiers package.json
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie tout le reste du code
COPY . .

# Spécifie le port exposé
EXPOSE 3000

# Démarre l'appli
CMD ["node", "src/start.js"]
