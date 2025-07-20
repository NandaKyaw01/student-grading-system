# Dockerfile

# 1. Base Stage: Use a modern, lightweight Node.js image
FROM node:22-alpine AS base


# 2. Dependencies Stage: Install dependencies, leveraging Docker cache
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# 3. Builder Stage: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client to ensure it's available for the build
RUN npx prisma generate

# This build-time ARG is necessary for "prisma migrate deploy"
# You will need to pass it during the 'docker build' command
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Build the application. This runs "prisma migrate deploy && next build"
RUN npm run build

# 4. Runner Stage: Create the final, minimal production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy required files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Explicitly copy the Prisma schema for the runtime client
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the app
CMD ["node", "server.js"]