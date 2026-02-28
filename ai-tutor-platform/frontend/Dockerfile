# ─── Stage 1: Build ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies with cache layer
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Copy source and build
COPY . .
RUN yarn build

# ─── Stage 2: Production nginx ────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
