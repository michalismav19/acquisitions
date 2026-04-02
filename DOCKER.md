# Docker Setup

This document explains how to run the **acquisitions** API locally with Neon Local and how to deploy it to production against Neon Cloud.

---

## How it works

| Environment | Database           | Compose file              | Dockerfile target |
|-------------|--------------------|---------------------------|-------------------|
| Development | Neon Local (proxy) | `docker-compose.dev.yml`  | `development`     |
| Production  | Neon Cloud         | `docker-compose.prod.yml` | `production`      |

The single env var that toggles the database path is `NEON_LOCAL_ENDPOINT`:

- **Set** → `src/config/db.js` configures `@neondatabase/serverless` to route all HTTP queries to the local proxy container.
- **Unset** (production) → the driver talks directly to Neon Cloud as normal.

---

## Prerequisites

- Docker Desktop ≥ 4.x (with Compose v2)
- A [Neon](https://console.neon.tech) account and project
- Your Neon API key and project/branch IDs (free tier works fine)

---

## Local development with Neon Local

### 1. Create your environment file

```bash
cp .env.development.example .env.development
```

Open `.env.development` and fill in:

| Variable           | Where to find it                                          |
|--------------------|-----------------------------------------------------------|
| `NEON_API_KEY`     | Neon Console → Account Settings → API Keys               |
| `NEON_PROJECT_ID`  | Neon Console → Project Settings → General                 |
| `PARENT_BRANCH_ID` | Neon Console → Branches → click your main branch → ID    |

Leave `DATABASE_URL` and `NEON_LOCAL_ENDPOINT` exactly as they are in the example file — they point to the `neon-local` Docker service.

### 2. Start the stack

```bash
docker compose -f docker-compose.dev.yml up --build
```

What happens:

1. The `neon-local` container starts, authenticates with your Neon project, and creates a **new ephemeral branch** forked from `PARENT_BRANCH_ID`.
2. The `app` container starts once `neon-local` is healthy, mounts your source directory, and runs `npm run dev` (hot-reload via `node --watch`).
3. Your app connects to Postgres at `postgres://neon:npg@neon-local:5432/neondb`.

### 3. Run migrations (first time or after schema changes)

```bash
docker compose -f docker-compose.dev.yml exec app yarn db:migrate
```

### 4. Stop the stack

```bash
docker compose -f docker-compose.dev.yml down
```

The ephemeral branch is **automatically deleted** from your Neon project when the `neon-local` container stops.

---

## Production with Neon Cloud

### 1. Create your environment file

```bash
cp .env.production.example .env.production
```

Set `DATABASE_URL` to the full connection string from **Neon Console → Connection Details** (keep `sslmode=require` and `channel_binding=require`).

Do **not** set `NEON_LOCAL_ENDPOINT` — leaving it unset tells the app to use the standard Neon Cloud driver path.

### 2. Build and start

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

The `production` Dockerfile stage installs only production dependencies and copies only the `src/` and `drizzle/` directories into a lean Alpine image.

### 3. Run migrations against production

```bash
docker compose -f docker-compose.prod.yml exec app yarn db:migrate
```

> **Tip:** In a real CI/CD pipeline inject `DATABASE_URL` (and any other secrets) as environment variables or from a secrets manager instead of committing `.env.production`.

### 4. Health check

```bash
curl http://localhost:3000/health
```

---

## Environment variable reference

| Variable               | Dev | Prod | Description                                                      |
|------------------------|-----|------|------------------------------------------------------------------|
| `PORT`                 | ✓   | ✓    | HTTP port the app listens on (default `3000`)                    |
| `NODE_ENV`             | ✓   | ✓    | `development` or `production`                                    |
| `LOG_LEVEL`            | ✓   | ✓    | Winston log level (`debug`, `info`, `warn`, `error`)             |
| `DATABASE_URL`         | ✓   | ✓    | Postgres connection string                                        |
| `NEON_LOCAL_ENDPOINT`  | ✓   | —    | HTTP endpoint for Neon Local proxy (`http://neon-local:5432/sql`) |
| `NEON_API_KEY`         | ✓   | —    | Neon API key (used only by the `neon-local` container)           |
| `NEON_PROJECT_ID`      | ✓   | —    | Neon project ID (used only by the `neon-local` container)        |
| `PARENT_BRANCH_ID`     | ✓   | —    | Branch to fork from when creating the ephemeral dev branch       |

---

## File overview

```
Dockerfile                  Multi-stage build (deps / development / production)
.dockerignore               Excludes node_modules, .env files, .git from image
docker-compose.dev.yml      App + Neon Local proxy for local development
docker-compose.prod.yml     App only, connecting to Neon Cloud
.env.development.example    Template for local dev secrets (commit this)
.env.production.example     Template for production secrets (commit this)
src/config/db.js            Configures neonConfig when NEON_LOCAL_ENDPOINT is set
```
