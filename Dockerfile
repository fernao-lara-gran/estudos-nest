# Base: dependências (inclui devDependencies para build e modo dev)
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Desenvolvimento: hot reload (use com compose profile dev)
FROM base AS development
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Build da aplicação compilada
FROM base AS builder
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# Produção: só runtime + dist
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
