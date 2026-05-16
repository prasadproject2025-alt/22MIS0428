# 22MIS0428

This repository contains a full-stack notification evaluation project with the following folders:

- `logging_middleware/` - shared logging utility and request middleware
- `notification_app_be/` - backend API service
- `notification_app_fe/` - React frontend application
- `notification_system_design.md` - system design and architecture documentation

## Running the project

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

## Notes

- The backend uses shared logging middleware and emits structured logs.
- The frontend is built with React, TypeScript, Vite, and Material UI.
- `notification_system_design.md` documents architecture and logging design.
