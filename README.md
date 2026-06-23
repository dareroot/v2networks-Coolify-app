# Task Manager — Full-Stack App

React + Vite · Node.js + Express · PostgreSQL

## Features

- JWT authentication (register / login / logout)
- Full CRUD for users and tasks
- Task statuses: `pending`, `in_progress`, `done`
- Filter tasks by status
- Profile page (update name, email, password; delete account)

## Project structure

```
v2-Coolify-app/
├── backend/
│   ├── src/
│   │   ├── db/          # pool.js, migrate.js
│   │   ├── middleware/  # auth.js (JWT)
│   │   ├── routes/      # auth.js, users.js, tasks.js
│   │   └── index.js
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/         # fetch client
│   │   ├── contexts/    # AuthContext
│   │   ├── components/  # Navbar
│   │   └── pages/       # Login, Register, Tasks, Profile
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
└── .env.example
```

## Local development (without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL running locally

### 1. Clone and configure

```bash
# Copy and edit env files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=appdb
DB_USER=your_pg_user
DB_PASSWORD=your_pg_password
JWT_SECRET=a_long_random_secret
CORS_ORIGIN=http://localhost:5173
```

Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:3000
```

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Run

```bash
# Terminal 1 — backend (auto-migrates DB on first start)
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Docker Compose

```bash
cp .env.example .env
# Edit .env with your secrets

docker compose up --build
```

- Frontend: http://localhost:4173
- Backend API: http://localhost:3000

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Create account |
| POST | /api/auth/login | — | Login → JWT |
| GET | /api/users/me | JWT | Get own profile |
| PUT | /api/users/me | JWT | Update profile |
| DELETE | /api/users/me | JWT | Delete account |
| GET | /api/tasks | JWT | List my tasks |
| POST | /api/tasks | JWT | Create task |
| GET | /api/tasks/:id | JWT | Get task |
| PUT | /api/tasks/:id | JWT | Update task |
| DELETE | /api/tasks/:id | JWT | Delete task |
| GET | /health | — | Health check |

## Deploy on Coolify

Coolify can deploy each service independently or via Docker Compose.

### Option A — Docker Compose (recommended)

1. Push this repo to GitHub/GitLab.
2. In Coolify → **New Resource → Docker Compose**.
3. Point to your repo. Coolify will detect `docker-compose.yml`.
4. Add the environment variables from `.env.example` in the Coolify UI.
5. Set `VITE_API_URL` to your backend's public URL (e.g. `https://api.yourdomain.com`).
6. Set `CORS_ORIGIN` to your frontend's public URL (e.g. `https://app.yourdomain.com`).
7. Deploy.

### Option B — Separate services

Deploy **backend** and **frontend** as separate Coolify services, each pointing to their own subdirectory and Dockerfile.

#### Backend service
- Build context: `./backend`
- Port: `3000`
- Env vars: `DB_*`, `JWT_SECRET`, `CORS_ORIGIN`
- Use Coolify's managed PostgreSQL or an external DB.

#### Frontend service
- Build context: `./frontend`
- Build arg: `VITE_API_URL=https://api.yourdomain.com`
- Port: `4173`

### Environment variables reference

| Variable | Service | Description |
|----------|---------|-------------|
| `DB_HOST` | backend | PostgreSQL host |
| `DB_PORT` | backend | PostgreSQL port (default 5432) |
| `DB_NAME` | backend | Database name |
| `DB_USER` | backend | Database user |
| `DB_PASSWORD` | backend | Database password |
| `JWT_SECRET` | backend | Secret for signing JWTs (min 32 chars) |
| `CORS_ORIGIN` | backend | Allowed frontend origin |
| `PORT` | backend | HTTP port (default 3000) |
| `VITE_API_URL` | frontend | Backend public URL (build-time) |

> **Security note:** generate a strong `JWT_SECRET` with `openssl rand -hex 32`.
