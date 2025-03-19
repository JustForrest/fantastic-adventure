FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy root package.json and workspace configs
COPY package.json ./
COPY .npmrc ./
COPY turbo.json ./

# Copy package.json files from all workspaces
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/search-indexer/package.json ./apps/search-indexer/
COPY packages/auth/package.json ./packages/auth/
COPY packages/config/package.json ./packages/config/
COPY packages/database/package.json ./packages/database/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npm run db:generate

# Base runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Add a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nodejs

# Copy needed files from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json 