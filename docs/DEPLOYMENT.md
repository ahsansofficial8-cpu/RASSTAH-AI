# RAASTAH (راستہ) — Production Deployment Guide

**Parent Company:** Apex Wireframe Pvt Ltd  
**Tagline:** THE INTELLIGENT WAY  
**Lead:** Ahsan Warraich  

> **CRITICAL POLICY:** DO NOT deploy or trigger automated deployments until final team sign-off. This document specifies the exact pre-configured production blueprint.

---

## 1. Architecture Overview
- **Frontend SPA**: Deployed to **Vercel** (`https://raastah.vercel.app`).
- **Backend API Server**: Deployed to **Render** as a Node.js Web Service (`https://raastah-backend.onrender.com`).
- **Database**: **MongoDB Atlas** via Mongoose. The backend requires `MONGODB_URI` for persistent account, guide, report, and trip features and does not fall back to local files. Without MongoDB it can run in degraded mode for stateless provider APIs; the health check remains HTTP 503.

---

## 2. Backend Deployment on Render

### Step 2.1: Render Web Service Configuration
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your repository or link the root `render.yaml` blueprint.
4. Specify the following parameters:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
   - **Instance Type**: Free or Starter

### Step 2.2: Environment Variables on Render
Set the following environment variables in the Render settings panel:

| Variable | Recommended Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production security and optimizations |
| `PORT` | `5000` | Standard internal listening port |
| `CLIENT_URL` | `https://raastah.vercel.app` | Whitelists production frontend domain for CORS |
| `SESSION_SECRET` | *(Auto-generated 32-character random string)* | Used for session protection |
| `JWT_SECRET` | *(Auto-generated 64-character secret key)* | Used for signing tokens |
| `BOOTSTRAP_ADMIN_EMAIL` | *(Provisioned administrator email)* | Optional; used only to create the first admin account when absent from the database |
| `BOOTSTRAP_ADMIN_PASSWORD` | *(Unique secret of at least 14 characters)* | Required with the bootstrap email; store as a deployment secret |
| `BOOTSTRAP_ADMIN_NAME` | *(Administrator display name)* | Optional display name for the initial admin account |
| `MONGODB_URI` | *(MongoDB Atlas connection URI)* | Required. Set Atlas network access and a least-privilege database user. |
| `PUBLIC_AI_ENDPOINT` | *(HTTPS OpenAI-compatible chat-completions endpoint)* | Optional. Enables the AI assistant and Pocket Guide. |
| `PUBLIC_AI_MODEL` | *(Model identifier accepted by that endpoint)* | Required together with `PUBLIC_AI_ENDPOINT`. |
| `PUBLIC_AI_API_KEY` | *(Provider key, if the endpoint requires one)* | Optional and server-side only; never use a `VITE_` prefix. |

Before moving an existing JSON database, run `npm run migrate:mongodb` from `server/` with `MONGODB_URI` configured. The migration copies records only into empty collections and never deletes the source JSON file. Back up both source and destination before migration.

OpenStreetMap Nominatim, OSRM, and Overpass are public community services with usage limits and no availability guarantee. Requests fail visibly if those services are unavailable; do not treat OSM road reports or mapped emergency facilities as official or complete.

---

## 3. Frontend Deployment on Vercel

### Step 3.1: Vercel Project Setup
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Select your repository.
4. In project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3.2: SPA Routing Configuration
The frontend project includes a pre-configured `client/vercel.json` file that automatically:
- Rewrites all non-asset requests to `/index.html` to avoid 404s on browser refreshes.
- Applies 1-year immutable caching headers to hashed assets in `/assets/`.
- Injects strict security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).

### Step 3.3: Environment Variables on Vercel
In the Vercel Project Settings under **Environment Variables**, add:

| Variable | Value | Notes |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://raastah-backend.onrender.com` | Directs Axios API calls to your live Render backend |

---

## 4. Verification Post-Deployment Checklist
- [ ] Set required `MONGODB_URI`, deploy the backend, and verify `/api/health` returns HTTP 200 with `database: "mongodb-connected"`.
- [ ] Confirm the backend health check returns HTTP 503 when MongoDB is unreachable.
- [ ] Verify `/api/tools/ai/status` reports pending configuration until an endpoint and model are configured.
- [ ] Verify `/api/safety/nearby` returns source-labelled Overpass results or a clear unavailable message.
- [ ] Visit `https://raastah.vercel.app` and verify theme loads without flicker.
- [ ] Click through `/destinations`, `/tools`, and `/packages`.
- [ ] Test sign-in using provisioned account credentials.
- [ ] Test Super Admin Command Center access at `/admin`.
- [ ] Verify SSL certificates and padlock icons on both domains.
