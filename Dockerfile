# Stage 1: Base with Alpine fixes
FROM node:22-alpine AS base
WORKDIR /app

# Fix Alpine repository issues and install dependencies
RUN echo "https://dl-cdn.alpinelinux.org/alpine/v3.20/main" > /etc/apk/repositories && \
    echo "https://dl-cdn.alpinelinux.org/alpine/v3.20/community" >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
    libc6-compat=1.2.4-r1 \
    openssl=3.1.4-r0 \
    git

# Stage 2: Dependencies
FROM base AS deps
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for Prisma)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Stage 3: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
ENV NEXT_TELEMETRY_DISABLED=1
RUN if [ -z "$DATABASE_URL" ]; then \
      echo "Skipping prisma migrate (no DATABASE_URL)"; \
      npm run build; \
    else \
      npx prisma migrate deploy && npm run build; \
    fi

# Stage 4: Runner (Production)
FROM base AS runner
WORKDIR /app

# Install production dependencies only
COPY --from=deps /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

# Copy built files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Runtime configuration
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000

# Start the application
CMD ["npm", "start"]