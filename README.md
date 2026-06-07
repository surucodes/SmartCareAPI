# SmartCare — Spandana Hospital Web Portal

A full-stack hospital management portal for **Spandana Hospital**, Sagara, Karnataka.

## Tech Stack

- **Backend**: ASP.NET Core 10, MongoDB Atlas, JWT auth, MailKit (Gmail SMTP)
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v3, Framer Motion, Lenis
- **Deployment**: Railway (API, Docker), Vercel (Frontend)
- **Domain**: spandanahospital.in

## Repository Layout

```
SmartCare.API/    ASP.NET Core API (controllers, repositories, services)
SmartCareUI/      React + Vite single-page app
```

## Local Development

### Prerequisites

- .NET 10 SDK
- Node.js 18+
- A MongoDB Atlas connection string (or local MongoDB)

### Backend

```bash
cd SmartCare.API
# Copy appsettings.Development.json.example to appsettings.Development.json
# and fill in your local MongoDB connection string, JWT secret, and Gmail creds.
# (appsettings.Development.json is gitignored.)
dotnet run
```

The API reads secrets from environment variables first (see
`SmartCare.API/.env.example`), falling back to `appsettings.Development.json`
for local work. A local `.env` file is auto-loaded via DotNetEnv.

### Frontend

```bash
cd SmartCareUI
cp .env.example .env.local          # or use the existing .env.development
# Set VITE_API_BASE_URL to your running API (e.g. http://localhost:5027)
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

## Environment Variables

| Side     | File / source                         | Notes                                    |
|----------|---------------------------------------|------------------------------------------|
| Backend  | `SmartCare.API/.env.example`          | Required env vars for production          |
| Backend  | `appsettings.Production.json`         | Structure + safe defaults, **no secrets** |
| Frontend | `SmartCareUI/.env.example`            | `VITE_API_BASE_URL`                       |

Never commit real secret values. All secrets live in the Railway and Vercel
dashboard environment variable settings. In production the API **fails fast on
startup** if `MONGODB_CONNECTION_STRING` or `JWT_SECRET` are missing.

## Production Builds

```bash
# Frontend
cd SmartCareUI && npm run build      # outputs dist/

# Backend
cd SmartCare.API && dotnet build -c Release
```

## Deployment

- **API** → Railway via `SmartCare.API/Dockerfile` (see `railway.json`).
  Listens on port `8080`, health check at `GET /health`. Set the env vars from
  `.env.example` in the Railway dashboard. Swagger is disabled in production.
- **Frontend** → Vercel (see `SmartCareUI/vercel.json`). The SPA rewrite rule
  ensures deep links like `/book` and `/doctors/prasanna` resolve to the app.

The cluster hosts two databases — `SmartCareDev` (development) and `SmartCare`
(production) — selectable via the `MONGODB_DATABASE` env var.
