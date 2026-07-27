FROM node:20-alpine AS base

WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY prisma/ ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 4000

FROM base AS production
CMD ["npm", "start"]

FROM base AS development
RUN npm install --dev
CMD ["npm", "run", "dev"]
