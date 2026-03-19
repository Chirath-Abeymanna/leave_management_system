# Work Ethics Application

A full-stack leave management system with:

- A Go backend API (Gin + PostgreSQL)
- A Next.js frontend
- Docker support for one-command local setup

## Table of Contents

- [Work Ethics Application](#work-ethics-application)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Prerequisites](#prerequisites)
    - [For Docker setup](#for-docker-setup)
    - [For manual setup](#for-manual-setup)
  - [Environment Variables](#environment-variables)
    - [Root `.env` (used by main `docker-compose.yml`)](#root-env-used-by-main-docker-composeyml)
    - [Backend `.env` (manual run)](#backend-env-manual-run)
    - [Frontend `.env.local` (manual run)](#frontend-envlocal-manual-run)
  - [Setup Option 1: Docker (Recommended)](#setup-option-1-docker-recommended)
  - [Setup Option 2: Manual Local Setup](#setup-option-2-manual-local-setup)
    - [1. Start PostgreSQL](#1-start-postgresql)
    - [2. Start backend](#2-start-backend)
    - [3. Start frontend](#3-start-frontend)
  - [Health Check and Access URLs](#health-check-and-access-urls)
  - [Common Commands](#common-commands)
    - [Docker logs](#docker-logs)
    - [Rebuild one service](#rebuild-one-service)
    - [Backend tests](#backend-tests)
    - [Frontend lint](#frontend-lint)
  - [Troubleshooting](#troubleshooting)
  - [Demo Video](#demo-video)

## Overview

This application manages employees and leave requests through a web UI and REST API.

## Tech Stack

- Backend: Go, Gin, PostgreSQL
- Frontend: Next.js, React, TypeScript
- Containerization: Docker, Docker Compose

## Project Structure

```text
.
|- docker-compose.yml          # Main compose file (postgres + backend + frontend)
|- backend/
|  |- cmd/server/main.go
|  |- config/config.go
|  |- migrations/
|  |- Dockerfile
|- frontend/
   |- src/
   |- Dockerfile
```

## Prerequisites

### For Docker setup

- Docker Desktop (or Docker Engine + Docker Compose)

### For manual setup

- Go (matching `backend/go.mod`, currently `1.25.0`)
- Node.js (recommended LTS) and npm
- PostgreSQL (local or remote)

## Environment Variables

### Root `.env` (used by main `docker-compose.yml`)

Create a file named `.env` in the project root:

```env
POSTGRES_USER=work_ethics_user
POSTGRES_PASSWORD=work_ethics_password
POSTGRES_DB=work_ethics_db
POSTGRES_HOST_AUTH_METHOD=scram-sha-256

DB_PORT=5433
APP_PORT=8080
FRONTEND_PORT=3000

JWT_SECRET=replace_this_with_a_secure_value
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

ADMIN_FULL_NAME=System Admin
ADMIN_EMAIL=admin@work-ethics.local
ADMIN_PASSWORD=change_this_admin_password

# Required for login/create-user routes
API_KEY=replace_with_strong_api_key
NEXT_PUBLIC_API_KEY=replace_with_strong_api_key
```

Notes:

- `NEXT_PUBLIC_API_URL` should include `/api/v1` for frontend requests.
- Keep `API_KEY` and `NEXT_PUBLIC_API_KEY` aligned.

### Backend `.env` (manual run)

Create `backend/.env`:

```env
APP_PORT=8080
DB_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=backend_db
DB_PORT=5432
DB_SSLMODE=disable
JWT_SECRET=supersecretkey

ADMIN_FULL_NAME=System Admin
ADMIN_EMAIL=admin@work-ethics.local
ADMIN_PASSWORD=Admin@123456

API_KEY=replace_with_strong_api_key
```

### Frontend `.env.local` (manual run)

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_API_KEY=replace_with_strong_api_key
```

## Setup Option 1: Docker (Recommended)

Use the **main** compose file at the repository root.

1. Create root `.env` (see above).
2. Build and run all services from the project root:

```bash
docker compose up --build -d
```

3. Check running containers:

```bash
docker compose ps
```

4. Stop services when needed:

```bash
docker compose down
```

5. Stop and remove volumes (resets database data):

```bash
docker compose down -v
```

## Setup Option 2: Manual Local Setup

### 1. Start PostgreSQL

Ensure PostgreSQL is running and reachable using the values in `backend/.env`.

### 2. Start backend

From `backend/`:

```bash
go mod tidy
go run ./cmd/server
```

The backend runs DB migrations on startup using the `backend/migrations` folder.

### 3. Start frontend

From `frontend/`:

```bash
npm install
npm run dev
```

## Health Check and Access URLs

- Frontend: http://localhost:3000
- Backend base: http://localhost:8080
- API health: http://localhost:8080/api/v1/health

## Common Commands

### Docker logs

```bash
docker compose logs -f
```

### Rebuild one service

```bash
docker compose up --build backend -d
docker compose up --build frontend -d
```

### Backend tests

From `backend/`:

```bash
go test ./...
```

### Frontend lint

From `frontend/`:

```bash
npm run lint
```

## Troubleshooting

- If login fails with API key errors:
  - Confirm `API_KEY` is set for backend.
  - Confirm `NEXT_PUBLIC_API_KEY` matches it in frontend.
- If frontend cannot reach backend:
  - Verify `NEXT_PUBLIC_API_URL` points to `http://localhost:8080/api/v1`.
- If database connection fails:
  - Verify host/port/user/password/database values in your env files.
  - Ensure PostgreSQL is running and reachable.

## Demo Video

Add your demo video URL here:

- Demo URL: `https://drive.google.com/file/d/1zYuBCjLGfYN5z88-9__o4JsdUR34Obnf/view?usp=sharing`
