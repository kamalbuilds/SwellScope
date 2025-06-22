# SwellScope Multi-stage Docker Build
# Optimized for production deployment on Swellchain ecosystem

# Stage 1: Build the backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy backend source code
COPY backend/src ./src
COPY backend/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build the backend
RUN npm run build

# Stage 2: Build the frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY next.config.js ./
COPY tailwind.config.js ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy frontend source code
COPY app ./app
COPY public ./public
COPY styles ./styles

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN npm run build

# Stage 3: Smart Contract Builder
FROM ghcr.io/foundry-rs/foundry:latest AS contract-builder

WORKDIR /app/contracts

# Copy Foundry configuration
COPY foundry.toml ./
COPY remappings.txt ./

# Copy smart contract source code
COPY src ./src
COPY script ./script
COPY test ./test

# Install dependencies
RUN forge install

# Build contracts
RUN forge build

# Stage 4: Production runtime
FROM node:18-alpine AS runtime

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    ca-certificates \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

# Copy built backend
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/package.json ./backend/package.json

# Copy built frontend
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=frontend-builder --chown=nextjs:nodejs /app/public ./public

# Copy smart contracts
COPY --from=contract-builder --chown=nextjs:nodejs /app/contracts/out ./contracts/out
COPY --from=contract-builder --chown=nextjs:nodejs /app/contracts/src ./contracts/src

# Create necessary directories
RUN mkdir -p /app/logs /app/data \
    && chown -R nextjs:nodejs /app/logs /app/data

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV BACKEND_PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/api/health || exit 1

# Expose ports
EXPOSE 3000 3001

# Switch to non-root user
USER nextjs

# Start script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]

# Labels for metadata
LABEL org.opencontainers.image.title="SwellScope"
LABEL org.opencontainers.image.description="Advanced restaking analytics and risk management platform for Swellchain"
LABEL org.opencontainers.image.url="https://swellscope.xyz"
LABEL org.opencontainers.image.source="https://github.com/kamalbuilds/swell-scope"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="SwellScope Team" 