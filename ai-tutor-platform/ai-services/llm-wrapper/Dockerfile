FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile || yarn install
COPY tsconfig.json ./
COPY src ./src
RUN yarn build

FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile --production || yarn install --production && yarn cache clean
COPY --from=builder /app/dist ./dist
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 5001
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD wget -qO- http://127.0.0.1:5001/health || exit 1
CMD ["node", "dist/index.js"]
