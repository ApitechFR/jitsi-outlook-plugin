# Construction de l'application
FROM node:18 AS build


WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Configuration Nginx pour servir les fichiers en production
FROM nginx:latest

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

COPY manifest.xml /usr/share/nginx/html/manifest.xml

COPY nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
