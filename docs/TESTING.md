# Raastah Verification Guide

Raastah must not rely on seeded sample users, drivers, hosts, trips, emergency locations, or fabricated road reports. For manual testing, use a dedicated test Atlas database, an account created through the actual registration flow, and real provider responses. Do not enter real traveler credentials or sensitive information into shared test environments.

## Automated checks

From the repository root:

```powershell
npm --prefix server test
npm --prefix client run build
```

The backend test suite validates Mongo geospatial schema indexes, behavior when MongoDB is disconnected, and AI endpoint configuration/error responses. It does not require Atlas or AI provider credentials. The frontend build checks the production bundle; it does not verify live third-party services.

## Manual integration checks

These checks require network access and, where noted, a dedicated Atlas database or configured AI provider. A failed upstream service must produce a visible unavailable/error state and must not result in invented data.

| Area | Check | Expected result |
|---|---|---|
| Startup and persistence | Start the API with a reachable `MONGODB_URI`, then open `/api/health`. Repeat with an unreachable database. | HTTP 200 when connected; HTTP 503 when disconnected. The service does not switch to a JSON file. |
| Migration | Run `npm run migrate:mongodb` against a disposable empty database, then repeat against a collection containing records. | Legacy records are copied only to empty collections; a populated target aborts safely. The source JSON file remains untouched. |
| Registration and sign-in | Register a unique account through the UI and sign in. Inspect API responses and the dedicated test database. | Passwords are hashed; responses contain no password or hash; successful sign-in reaches the configured in-app destination. |
| Admin review | Submit a real driver application using a test identity and review it in the admin UI. | It remains pending until approval. Only approved drivers with service coordinates appear in nearby lookup results. |
| Road reports | Submit a report with optional browser location and inspect the report feed before and after admin review. | The feed shows stored report details and review status. Reports are community-submitted, not official road advisories. |
| OSM safety lookup | Allow browser geolocation and query nearby facilities. Repeat with Overpass unavailable. | Results link to OpenStreetMap and reflect returned source data. Provider failure is explicit; no fallback facilities or automatic emergency contact is shown. |
| Route estimate | Request a route between two valid places and inspect the source and limitations. | A fresh OSRM estimate is shown when available. It is not described as live traffic, road safety, transit schedule, or guaranteed road access. |
| Weather | Load a destination weather panel and test with the provider unavailable. | Values are provider responses; failure is displayed rather than replaced with invented weather. |
| AI and Pocket Guide | Test with no AI settings, then with a configured provider. | Missing configuration is reported as unavailable. With configuration, only the provider's actual response is shown; a returned translation may be cached on the device. |
| SOS sharing | Grant browser location permission and inspect map/share links without sending them. | Location is user-controlled; Raastah does not automatically dispatch to emergency services or contacts. |

Do not record tests as passed unless they were run against the documented build and provider conditions. Live Atlas, AI, Overpass, routing, and weather integrations have not been verified merely by passing local automated checks.
