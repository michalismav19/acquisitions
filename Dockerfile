# ============================================================
# Stage 1: deps — install ALL dependencies (dev + prod)
#           Used as the base for the development image and
#           as a cache layer for the production build.
# ============================================================
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ============================================================
# Stage 2: development — hot-reload dev server
#           docker-compose.dev.yml mounts source via volume,
#           so no COPY of src is needed here.
# ============================================================
FROM deps AS development
ENV NODE_ENV=development
EXPOSE 3000
CMD ["yarn", "dev"]

# ============================================================
# Stage 3: production — lean image, prod deps only
# ============================================================
FROM node:22-alpine AS production
WORKDIR /app

# Install only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Copy application source and migration artifacts
COPY src ./src
COPY drizzle.config.js ./
COPY drizzle ./drizzle

ENV NODE_ENV=production
EXPOSE 3000
CMD ["yarn", "start"]
