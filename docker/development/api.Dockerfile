FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/config/package.json ./packages/config/
COPY packages/auth/package.json ./packages/auth/

# Install dependencies
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npm run db:generate

# Build the application
RUN npm run build --workspace=api

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Install wget for health checks
RUN apk add --no-cache wget

# Copy necessary files
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port (using ARG to allow override)
ARG PORT=3001
ENV PORT=${PORT}
EXPOSE ${PORT}

# Run the application
CMD ["node", "dist/index.js"] 