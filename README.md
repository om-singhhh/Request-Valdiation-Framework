# Request Validation Framework

Full-stack sample for **dynamic API request validation**: validation rules live in **MongoDB**, the Express server **loads them at runtime**, builds **Joi** schemas, validates incoming JSON with **type coercion**, and returns **structured, user-friendly errors**. The **React (Vite)** dashboard loads those same definitions to **generate forms**, exercise `POST /register` and `POST /login`, and surface errors with **inline field hints** plus **toasts**.

The U.I. follows a **minimal black canvas**, **sharp typography**, **yellow accent**, and **layered “3D” hero type** similar to high-end editorial layouts.

## Prerequisites

- **Node.js** 20+ recommended  
- **MongoDB** running locally (e.g. `mongodb://127.0.0.1:27017`) or a **MongoDB Atlas** URI

## Quick start

### 1. MongoDB

Start local MongoDB (installation depends on your OS), or create a cluster on Atlas and copy the connection string.

### 2. Backend

```bash
cd server
cp .env.example .env
# Edit .env if needed (MONGODB_URI, PORT, CORS_ORIGIN)

npm install
npm run seed    # Inserts sample `register` and `login` validation definitions
npm run dev     # API: http://localhost:4000
```

Health check: `GET http://localhost:4000/health`  
List schemas (for the UI): `GET http://localhost:4000/api/schemas`

### 3. Frontend

```bash
cd client
cp .env.example .env
# Optional: change VITE_API_URL if the API is not on localhost:4000

npm install
npm run dev     # App: http://localhost:5173
```

## API overview

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service probe |
| `GET` | `/api/schemas` | All active validation definitions (field list, types, rules) |
| `GET` | `/api/schemas/:routeKey` | One definition (e.g. `register`, `login`) |
| `POST` | `/register` | Sample endpoint validated by the `register` MongoDB document |
| `POST` | `/login` | Sample endpoint validated by the `login` MongoDB document |

Validation responses on failure are `400` with:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "fields": [
      { "path": "email", "messages": ["Please enter a valid email address."], "type": "..." }
    ],
    "details": [ ... ]
  }
}
```

Joi is run with `convert: true`, `abortEarly: false`, and `stripUnknown: true` so rules are predictable and errors are aggregated per request.

## Project layout

- `server/src` — Express app, Mongoose model, Joi builder, dynamic middleware, seed data  
- `client/src` — Vite + React dashboard, Tailwind v4, Radix Slot + CVA (shadcn-style primitives), Sonner toasts, Framer Motion

## Perf and architecture notes

- Validation configs are **cached in memory** after first load per `routeKey` (see `server/src/services/schemaCache.js`). Restart the server or extend with invalidation if you add admin writes later.  
- The frontend **does not bundle** validation logic: it mirrors the API from `/api/schemas` so the server remains the single source of truth.

## Troubleshooting Atlas on Windows (`querySrv ECONNREFUSED`)

`mongodb+srv://` relies on **DNS SRV** lookups (e.g. `_mongodb._tcp.<cluster>.mongodb.net`). Some networks, VPNs, or DNS servers block or mishandle those queries, which produces:

`Error: querySrv ECONNREFUSED` or similar.

**Fix 1 — Standard connection string (recommended):** In Atlas, open **Connect → Drivers** and use the **`mongodb://`** form that lists **three shard hosts** on port `27017`, plus `replicaSet` and `ssl=true`. Put that full URL in `server/.env` as `MONGODB_URI` (no code changes required).

**Fix 2 — DNS:** Set your adapter DNS to **1.1.1.1** / **8.8.8.8**, run `ipconfig /flushdns`, then try `mongodb+srv://` again.

**Fix 3:** Temporarily disable VPN / corporate filter and retry.


