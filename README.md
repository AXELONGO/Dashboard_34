# Dashboard 34 — React Full-Stack

Proyecto full-stack con frontend en **React + Vite + TypeScript** y backend en **Node.js + Express** (ecosistema JavaScript unificado).

## Arquitectura

- `src/`: frontend React.
- `backend_react/`: backend REST (`/api/*`) en Node.js.
- `docker-compose.yml`: levanta frontend y backend.

## Backend API

Rutas principales (`backend_react/src/server.js`):

- `GET /health`
- `POST /api/ai/generate-leads`
- `GET /api/leads`
- `POST /api/leads`
- `GET /api/history`
- `POST /api/history`
- `GET /api/clients`
- `POST /api/clients`
- `GET /api/clients/history`
- `POST /api/clients/history`
- `GET /api/support-tickets`
- `PATCH /api/pages/:pageId`
- `POST /api/webhook`

## Variables de entorno (backend)

Definir en `.env` (o en tu entorno):

- `NOTION_API_KEY`
- `NOTION_DATABASE_ID`
- `NOTION_HISTORY_DB_ID`
- `NOTION_CLIENTS_DB_ID`
- `NOTION_CLIENTS_HISTORY_DB_ID`
- `NOTION_SUPPORT_DB_ID`
- `GEMINI_API_KEY` (opcional; si no existe se usa fallback)

## Ejecución local

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend_react
npm install
npm run dev
```

## Pruebas y checks

```bash
npm run build
node --check backend_react/src/server.js
node --test backend_react/src/utils/notionMappers.test.js
```

## Docker

```bash
docker compose up --build
```

- Frontend: `http://localhost:8082`
- Backend: `http://localhost:8001`

## Mejoras de calidad aplicadas

- Corrección de errores de tipado en `src/App.tsx`.
- Manejo centralizado de errores en Express.
- Endpoint de salud `/health`.
- Timeout y fallback en generación de leads por IA.
- Pruebas unitarias para mapeadores de Notion.
