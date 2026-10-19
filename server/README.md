# Raastah API

This directory contains the Express API for Raastah. It uses MongoDB through Mongoose and does not fall back to local JSON persistence.

## Local setup

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Set `MONGODB_URI` in `server/.env` to a MongoDB Atlas database that is reachable from your machine, then start the API:

```powershell
npm start
```

The API listens on port 5000 by default. `GET /api/health` returns HTTP 200 only when MongoDB is connected and HTTP 503 otherwise.

## Optional AI configuration

Set `PUBLIC_AI_ENDPOINT` and `PUBLIC_AI_MODEL` to enable chat and Pocket Guide translation. If the provider requires authentication, set `PUBLIC_AI_API_KEY`. These are backend environment variables and must not be exposed to the client. If unset or unreachable, the API reports the feature as unavailable; it does not return canned responses.

## Existing JSON data migration

With `MONGODB_URI` configured, run:

```powershell
npm run migrate:mongodb
```

The script refuses to import into non-empty collections and does not remove the original JSON file. Back up the source and target before migration.

## Tests

```powershell
npm test
```

The integration tests check schema/index contracts and AI-provider configuration behavior without requiring real provider credentials. Live MongoDB, Overpass, and AI-provider behavior still requires configured network services.

See [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md), [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md), and [../docs/CREDENTIALS.md](../docs/CREDENTIALS.md) for architecture and deployment details.
