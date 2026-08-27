FROM node:20-alpine

WORKDIR /app

# Instalar OpenSSL requerido por Prisma Client en Linux Alpine
RUN apk add --no-cache openssl

# Copiar archivos de configuración de paquetes y esquema de Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias para que el CLI de Prisma esté disponible durante el build
RUN npm ci

# Copiar el resto del código fuente del backend
COPY . .

# Generar el cliente de Prisma dentro del contenedor Docker
RUN npx prisma generate

# Exponer el puerto de la aplicación Express
EXPOSE 4000

# Ejecutar migraciones automáticas al iniciar el contenedor y luego encender el servidor Express
CMD ["sh", "-c", "npx prisma db push --skip-generate && node src/server.js"]
