# Smart Parking Reservation System

Two independent projects (no root workspace scripts). Requires **two terminals**.

## Commands

### Backend (`smart-parking-backend/`) — NestJS 11, TypeScript, TypeORM, PostgreSQL
- `npm run start:dev` — dev server (port **3000**, hot-reload)
- `npm run build` — compile to `dist/`
- `npm run lint` — ESLint with `--fix`
- `npm run format` — Prettier (singleQuote, trailingComma all)
- `npm test` — Jest unit tests (`*.spec.ts`)
- `npm run test:e2e` — E2E tests (`*.e2e-spec.ts`)
- Single test: `npx jest -- path/to/test.spec.ts`
- `.env` contains live credentials — do not commit
- `synchronize: true` in TypeORM — auto-creates tables; use migrations for prod
- Handlebars email templates in `src/mail/templates/*.hbs`
- NestJS CLI assets config copies `**/*.hbs` to `dist/`

### Frontend (`smart-parking-frontend/`) — Next.js 16, React 19, JS (no TypeScript)
- `npm run dev` — dev server on port **300** (not 3000!)
- `npm run build` / `npm run start` — production build/start
- `npm run lint` — ESLint (flat config)
- **No test framework** — do not try to run frontend tests
- Tailwind CSS v4 — uses `@import "tailwindcss"` (not `@tailwind` directives)
- JWT in cookies (`token` + `user`) managed via Zustand + `js-cookie`
- `src/proxy.js` is auth middleware, not an API proxy
- `src/services/api.js` Axios instance auto-attaches JWT from cookies
- `jsconfig.json` path alias: `@/` maps to `./src/*`
- Existing AGENTS.md in this directory warns about Next.js 16 breaking changes

## Architecture
- **Auth:** JWT + Passport.js; RolesGuard with `@Roles()` decorator
- **Entities:** User, ParkingArea, Slot, Reservation (auto-increment IDs, not UUIDs)
- **Seed:** `src/seed/seed.service.ts` creates `admin@admin.com` / `admin` on first startup (`OnApplicationBootstrap`)
- **Frontend routes:** `/login`, `/register`, `/dashboard/user`, `/dashboard/admin`, `/parking/[id]`, `/reservations`
- Backend full API docs in root `README.md`
