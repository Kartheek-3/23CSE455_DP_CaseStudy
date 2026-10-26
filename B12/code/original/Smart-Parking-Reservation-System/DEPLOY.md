# Deploy to Render

Two independent Node services — create **two Web Services** in the Render dashboard.

## Before you start

1. Push the repo to GitHub (Render pulls from Git).
2. The `main.ts` port fix (`process.env.PORT ?? 3000`) and the seed service are already applied.
3. You need a PostgreSQL database. Use **Neon** (free, multiple DBs) or any provider that gives a connection string.

---

## 1. Backend Web Service

| Field | Value |
|---|---|
| **Name** | `smart-parking-backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Root Directory** | `smart-parking-backend` |
| **Plan** | Free |

### Environment variables (set in Render dashboard — do not commit)

| Variable | Value |
|---|---|
| `NODE_VERSION` | `20` |
| `DATABASE_URL` | `postgresql://neondb_owner:[EMAIL_ADDRESS]:5432/neondb?sslmode=require` |
| `JWT_SECRET` |` |
| `MAIL_HOST` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USER` | `[EMAIL_ADDRESS]` |
| `MAIL_PASSWORD` | `jkyy myah rbsr pntw` |
| `MAIL_FROM` |   your Gmail address |

The backend automatically uses `DATABASE_URL` with SSL when set, and falls back to individual `DB_HOST`/`DB_PORT`/`DB_USERNAME`/`DB_PASSWORD`/`DB_DATABASE` vars for local development.

---

## 2. Frontend Web Service

| Field | Value |
|---|---|
| **Name** | `smart-parking-frontend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Root Directory** | `smart-parking-frontend` |
| **Plan** | Free |

### Environment variables

| Variable | Value |
|---|---|
| `NODE_VERSION` | `20` |
| `NEXT_PUBLIC_API_URL` | `https://<backend-service-name>.onrender.com` |

The frontend uses `next start` which respects Render's injected `PORT` env var automatically.

---

## After deploying

- Open the frontend URL and verify login/registration works.
- A **built-in admin** is auto-created on first startup:
  - Email: `admin@admin.com`
  - Password: `admin`
- If CORS errors appear, check that `origin: true` is still set in `src/main.ts` (it allows the requesting origin dynamically).
