# Użycie obrazu Node.js do budowania aplikacji 
FROM node:16 AS build

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie plików projektu
COPY package.json package-lock.json ./

# Instalacja zależności
RUN npm install

# Kopiowanie reszty plików projektu
COPY . .

# Budowanie aplikacji React
RUN npm run build

# Użycie serwera NGINX do serwowania plików
FROM nginx:1.23

# Kopiowanie pliku konfiguracji NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopiowanie zbudowanej aplikacji do katalogu NGINX
COPY --from=build /app/build /usr/share/nginx/html

# Exponowanie portu 80
EXPOSE 80

# Uruchamianie serwera NGINX
CMD ["nginx", "-g", "daemon off;"]
