# Backend

This README documents only the backend part of the application: folder structure and how to run it.

## Structure

```text
backend/
|- cmd/
|  |- server/
|     |- main.go                  # Application entrypoint
|- config/
|  |- config.go                   # Environment config loader
|- internal/
|  |- app/v1/
|  |  |- routes.go                # API route registration (/api/v1)
|  |  |- controllers/             # HTTP handlers
|  |  |- services/                # Business logic
|  |  |- repositories/            # Data access layer
|  |  |- models/                  # Domain models
|  |  |- interfaces/              # Service/repository contracts
|  |- middleware/
|  |  |- jwt.go                   # API key and JWT middleware
|  |- pkg/
|     |- database/                # Migration helpers
|     |- logger/                  # Logging setup
|- migrations/                    # SQL migration files
|- tests/                         # Seed and test helpers
|- go.mod                         # Go module definition
|- Dockerfile                     # Backend container image
|- docker-compose.yml             # Backend-scoped DB compose setup
```

## Run Backend Locally

### 1. Create environment file

Create `backend/.env` (you can copy from `backend/.env.example`) and set values:

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

### 2. Ensure PostgreSQL is running

Backend requires PostgreSQL before startup.

### 3. Install dependencies and run

From the `backend` directory:

```bash
go mod tidy
go run ./cmd/server
```

Backend runs at:

- http://localhost:8080
- Health check: http://localhost:8080/api/v1/health

## Backend Commands

From the `backend` directory:

```bash
go test ./...     # run tests
go run ./cmd/server
```

## Run Backend Database with Backend Compose

If you only want PostgreSQL for backend development, from `backend`:

```bash
docker compose up -d
```

This starts the backend-local Postgres service defined in `backend/docker-compose.yml`.

## Run Backend with Main Docker Compose

From project root, run backend with dependencies:

```bash
docker compose up --build backend -d
```

Or start all services:

```bash
docker compose up --build -d
```
