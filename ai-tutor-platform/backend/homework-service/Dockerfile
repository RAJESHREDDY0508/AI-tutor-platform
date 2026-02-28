# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (cached layer)
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Copy source
COPY nest-cli.json tsconfig.json ./
COPY src ./src

# Build NestJS app
RUN yarn build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

# Install production dependencies only
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Drop root privileges
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8004

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:8004/v1/health || exit 1

CMD ["node", "dist/main.js"]
