npm run dev
# 22MIS0428

This project contains three folders:

- `logging_middleware/` — shared logging code
- `notification_app_be/` — backend API (Express + TypeScript)
- `notification_app_fe/` — frontend app (React + Vite + TypeScript)

What you need to run this project (basic):

- Node.js (version 18 or later)
- npm
- A terminal (PowerShell or similar on Windows)

Simple steps to run locally:

1. Clone the repository and open a terminal in the project folder:

```bash
git clone https://github.com/prasadproject2025-alt/22MIS0428.git
cd 22MIS0428
```

2. Prepare the shared logger (build it first):

```powershell
cd logging_middleware
npm install
npm run build
cd ..
```

3. Prepare and start the backend:

```powershell
cd notification_app_be
npm install
npm run build

# (optional) set API token used by the backend; default in code is 'test-token'
$env:API_TOKEN = 'test-token'

npm run start
```

4. Prepare and start the frontend:

```powershell
cd notification_app_fe
npm install

# (optional) set token for frontend requests (defaults to 'test-token')
$env:VITE_API_TOKEN = 'test-token'

npm run dev
```

Open http://localhost:3000 in your browser to view the app.

Notes:

- The backend route `GET /evaluation-service/notifications` requires an `Authorization: Bearer <token>` header. By default the token used in this project is `test-token`.
- The backend uses a small hard-coded dataset for notifications (see `notification_app_be/src/server.ts`). Replace with a real database for production.
- If the backend fails with module resolution errors, make sure `logging_middleware` was built so `dist/logger.js` exists.

If you want, I can add a short script to start both services together. Tell me if you'd like that.

