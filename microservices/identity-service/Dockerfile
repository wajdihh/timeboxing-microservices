# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root and workspace package files
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY microservices/identity-service/package.json ./microservices/identity-service/package.json

# Install dependencies for all workspaces
RUN npm install --workspaces

# Copy source code
COPY packages/shared ./packages/shared
COPY microservices/identity-service ./microservices/identity-service

# Build shared package first
RUN npm run build --workspace=@timeboxing/shared

# Build identity-service
RUN npm run build --workspace=identity-service

# Runtime stage
FROM node:18-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy built artifacts
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=appuser:appgroup /app/microservices/identity-service/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Expose port
EXPOSE ${PORT:-3000}

# Command to run the app
CMD if [ "$NODE_ENV" = "production" ]; then \
      node dist/main.js; \
    else \
      npm run start:dev; \
    fi
