# Frontend

This README documents only the frontend part of the application: folder structure and how to run it.

## Structure

```text
frontend/
|- src/
|  |- app/                     # Next.js app router pages and layout
|  |  |- (pages)/              # Feature pages (dashboard, employees, leaves, etc.)
|  |- components/              # Reusable UI and feature components
|  |  |- dashboard/
|  |  |- employee/
|  |  |- layout/
|  |  |- leaves/
|  |  |- ui/
|  |- lib/                     # API client, auth context, shared types/utils
|- public/                     # Static assets
|- package.json                # Scripts and dependencies
|- next.config.ts              # Next.js config
|- tsconfig.json               # TypeScript config
|- Dockerfile                  # Frontend container image
```

## Run Frontend Locally

### 1. Install dependencies

From the `frontend` directory:

```bash
npm install
```

### 2. Create environment file

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_API_KEY=replace_with_same_api_key_as_backend
```

### 3. Start dev server

```bash
npm run dev
```

Frontend will run at:

- http://localhost:3000

## Frontend Scripts

From the `frontend` directory:

```bash
npm run dev     # start development server
npm run build   # create production build
npm run start   # run production build
npm run lint    # run eslint
```

## Run Frontend with Docker

From the project root, run the main compose file:

```bash
docker compose up --build frontend -d
```

Or run all services:

```bash
docker compose up --build -d
```
