# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
COPY drizzle.config.ts ./

# Устанавливаем все зависимости (включая dev для сборки)
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Копируем зависимости
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/drizzle.config.ts ./

# Копируем исходный код
COPY . .

# Сборка frontend
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Копируем package.json
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Копируем собранное приложение из builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/public ./public

# Создаем не-root пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

# Открываем порт
EXPOSE 5000

# Команда запуска
CMD ["node", "dist/index.js"]