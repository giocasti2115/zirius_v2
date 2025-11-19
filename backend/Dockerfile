# Dockerfile para Backend - Node.js + TypeScript
FROM node:18-alpine

# Instalar dumb-init para manejo de señales y wget para health check
RUN apk add --no-cache dumb-init wget

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci && npm cache clean --force

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar el código fuente
COPY --chown=nodejs:nodejs . .

# Compilar TypeScript
RUN npm run build

# Cambiar al usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3002

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3002

# Comando de inicio con dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]