FROM node:22-alpine

# Mettre à jour npm pour corriger les vulnérabilités
# de ses dépendances intégrées, lorsque des correctifs existent
RUN npm install --global npm@latest

WORKDIR /app

COPY package*.json ./

# RUN npm ci --omit=dev
RUN npm ci --omit=dev \
    && npm cache clean --force \
    && rm -rf /usr/local/lib/node_modules/npm \
              /usr/local/bin/npm \
              /usr/local/bin/npx

COPY . .

EXPOSE 3000

USER node

#CMD ["npm", "start"]
CMD ["node", "app.js"]