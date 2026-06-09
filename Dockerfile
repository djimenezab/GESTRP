FROM node:20-alpine

# Creamos y nos metemos en la carpeta de la app
WORKDIR /app

# Copiamos los archivos que dicen qué dependencias instalar
COPY package*.json ./

# Instalamos todas las dependencias
RUN npm install

# Copiamos el resto del código del proyecto al contenedor
COPY . .

# Compilamos el proyecto (genera la carpeta dist)
RUN npm run build

# Exponemos los puertos que usa tu app
EXPOSE 3000
EXPOSE 5000

# Comando para arrancar en producción
CMD ["npm", "start"]
