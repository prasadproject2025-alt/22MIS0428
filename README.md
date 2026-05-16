 22MIS0428

This repository contains a full-stack notification evaluation project with the following folders:
This repository contains a full-stack notification evaluation project. Top-level structure:

- `logging_middleware/` - shared logging utility and request middleware
- `notification_app_be/` - backend API service
- `notification_app_fe/` - React frontend application
- `notification_system_design.md` - system design and architecture documentation

## Running the project
## Prerequisites

1. Install dependencies in each folder:
   - `cd logging_middleware && npm install`
   - `cd notification_app_be && npm install`
   - `cd notification_app_fe && npm install`
2. Build the logging package and backend:
   - `cd logging_middleware && npm run build`
   - `cd notification_app_be && npm run build`
3. Start the backend and frontend servers:
   - `cd notification_app_be && npm run start`
   - `cd notification_app_fe && npm run dev`
- Node.js (v18+ recommended)
- npm

## Quick start (clone)

```bash
git clone https://github.com/prasadproject2025-alt/22MIS0428.git
cd 22MIS0428
```

## Install, build and run (per package)

1) Install and build the shared logging middleware (required before building backend):

```powershell
cd logging_middleware
npm install
npm run build
cd ..
```

2) Install and build the backend, then start it (default port 3001):

```powershell
cd notification_app_be
npm install
npm run build

# optional: set API token used by the protected route (defaults to 'test-token')
$env:API_TOKEN = 'test-token'

# start backend (foreground)
npm run start
```

3) Install frontend deps and start the Vite dev server (port 3000):

```powershell
cd notification_app_fe
npm install

# optional: set frontend token used by fetch (defaults to 'test-token')
$env:VITE_API_TOKEN = 'test-token'

npm run dev
```

Open the frontend at: http://localhost:3000

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/3d13b593-a0ee-43e3-a2ab-b98314bc15d0" />


## Environment variables

- `API_TOKEN` — token required by backend `GET /evaluation-service/notifications`. Defaults to `test-token` in code.
- `VITE_API_TOKEN` — optional value the frontend will send as `Authorization: Bearer <token>` (frontend also falls back to `test-token`).
- `LOGGING_API_TOKEN` — set to enable sending logs to the remote logging API (default remote URL is `http://4.224.186.213/evaluation-service/logs`).

## Quick verification (after servers are running)

```powershell
# backend (protected)
curl.exe -v -H "Authorization: Bearer test-token" "http://localhost:3001/evaluation-service/notifications?limit=2"

# frontend (vite HTML)
curl.exe -s -D - "http://localhost:3000/" | Select-String -Pattern "<title>"
```

## Troubleshooting

- If you see `ERR_MODULE_NOT_FOUND` when starting the backend, ensure `logging_middleware` was built and `dist/logger.js` exists (step 1).
- If frontend fetch returns `401`, confirm `VITE_API_TOKEN` or `test-token` matches backend `API_TOKEN`.
- If ports 3000 or 3001 are occupied, change backend `PORT` or Vite `--port` in `notification_app_fe/package.json` scripts.
- If npm install fails on Windows due to file locks, delete `node_modules` and retry, or restart your terminal/editor.

## Notes

- The backend uses shared logging middleware and emits structured logs.
- The backend route is protected by `Authorization: Bearer <token>` on `GET /evaluation-service/notifications`.
- The frontend is built with React, TypeScript, Vite, and Material UI.
- `notification_system_design.md` documents architecture, API design, and scaling decisions.
- The backend currently uses an in-memory hardcoded dataset for notifications (see `notification_app_be/src/server.ts`). For production, replace with a persistent DB and migration scripts.
- Logging helper is implemented in `logging_middleware` and follows the `Log(stack, level, package, message)` contract.
