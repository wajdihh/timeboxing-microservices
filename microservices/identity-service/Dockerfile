# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root and workspace package files
COPY package.json ./
COPY shared/package.json ./shared/package.json
COPY microservices/identity-service/package.json ./microservices/identity-service/package.json
COPY tsconfig.base.json ./
COPY microservices/identity-service/tsconfig*.json ./
# Install dependencies for all workspaces
RUN npm install --workspaces

# Copy entire project structure maintaining paths
COPY . .


# Build shared package first
RUN npm run build --workspace=@timeboxing/shared

# Build identity-service
RUN npm run build --workspace=identity-service

# Runtime stage
FROM node:18-alpine
WORKDIR /app


# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create logs directory and set permissions (Winston logs as non-root user)
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app/logs

USER appuser

# Copy built artifacts and package files
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/shared/package.json ./shared/package.json
COPY --from=builder --chown=appuser:appgroup /app/shared/dist ./shared/dist
COPY --from=builder --chown=appuser:appgroup /app/microservices/identity-service/package.json ./package.json
COPY --from=builder --chown=appuser:appgroup /app/microservices/identity-service/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/tsconfig*.json ./


# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Expose port
EXPOSE ${PORT:-3000}

# Clean, explicit production CMD
CMD [ "node", "dist/main.js" ]
