# Raastah API

Base URL locally: `http://localhost:5000/api`. The Express API can start in degraded mode without MongoDB, but database-backed routes return HTTP 503 until a working MongoDB URI is configured. Authentication uses an HTTP-only cookie; admin routes require an administrator account provisioned by the deployment operator. See [DEPLOYMENT.md](./DEPLOYMENT.md) for configuration.

External-data routes identify the source and may return an unavailable error when a provider is unreachable. No endpoint should substitute fabricated or stale data as if it were current.

## Health and authentication

| Method and path | Purpose |
|---|---|
| `GET /health` | Reports API, MongoDB, and AI configuration status. HTTP 200 indicates MongoDB is connected; HTTP 503 indicates degraded database health. |
| `POST /auth/register` | Creates an account and signs it in. Requires `name`, `email`, and `password`; optional `phone` and `city`. |
| `POST /auth/login` | Signs in using `email` and `password`. |
| `GET /auth/me` | Returns the current signed-in account. |
| `POST /auth/logout` | Clears the authentication cookie. |
| `PUT /auth/profile` | Updates the signed-in user's profile. |
| `POST /auth/forgot-password` | Returns 503 until a verified recovery delivery service is configured. |

## Travel, routing, and safety

| Method and path | Purpose |
|---|---|
| `GET /routes/search-locations?q=...` | Searches Pakistan locations using Nominatim. Returns provider-labelled suggestions; subject to public-service limits. |
| `POST /routes/estimate` | Gets a road-network distance/duration estimate and available alternative paths from Nominatim and OSRM. Alternatives are not guaranteed to avoid a community-reported closure; this is not live traffic, safety, road opening, toll, transit, or price data. |
| `GET /safety/nearby?lat=...&lng=...` | Queries Overpass for mapped police/hospital facilities within 50 km, then returns those current lookup results. Map data may be incomplete; upstream failure is explicit. |
| `GET /reports/road/community?destinationSlug=...` | Lists recent traveler reports, limited to the last 72 hours. Reports are community observations, not official advisories. |
| `POST /reports/road/community` | Stores a traveler report for admin review. Requires `destinationSlug`, `roadOrPass`, `condition`, and `description`; optional `coordinates` are `[longitude, latitude]`. |
| `POST /guides/applications` | Submits a driver/guide profile for private review. Applications are not public or verified on submission; `city` is optional, and the submitted contact is published after approval only when `publishContact: true` is explicitly consented to. |
| `GET /guides` | Lists administrator-approved guide/driver profiles, including consented public service-base coordinates and only explicitly published contact information for the operator map. Private contact details are not returned. |
| `GET /guides/nearby?lat=...&lng=...` | Finds approved profiles with saved coordinates within 50 km. |

## AI and media

| Method and path | Purpose |
|---|---|
| `GET /tools/ai/status` | Reports whether the server has a valid AI endpoint and model configured. |
| `GET /live/currency` | Proxies the latest USD base rate from Exchange Rate API and returns the PKR rate and attribution source. |
| `GET /live/road-weather?lat=...&lng=...&location=...` | Returns current and near-term Open-Meteo conditions for a Pakistan location with provider-based weather flags. Weather is not an official road closure or safety advisory. |
| `GET /live/facilities?lat=...&lng=...` | Finds the nearest mapped hospital/clinic and fuel station within 50 km using OpenStreetMap Overpass. Null facility values mean no mapped result was found. |
| `POST /tools/translate` | Requests a translation from the configured OpenAI-compatible provider. Requires `text`, `sourceLanguage`, and `targetLanguage`. Missing configuration returns 503; provider failure returns 502. |
| `POST /tools/translate/mymemory` | Requests a limited-use translation from MyMemory without AI credentials. Requires `text`, `sourceLanguage`, and `targetLanguage`; returns 429 when the free provider limit is reached. |
| `POST /tools/chatbot` | Sends a question and up to 12 prior user/assistant messages to the configured provider, with live weather, exchange-rate, and recent community-report context when a valid destination is supplied and sources respond. Null/missing context is not invented. |
AI settings are `PUBLIC_AI_ENDPOINT` and `PUBLIC_AI_MODEL`, plus optional `PUBLIC_AI_API_KEY`. They are server-only. The app does not bundle an offline model and does not return a canned answer when configuration is missing.

## Accounts and administration

- `POST /bookings` currently returns HTTP 503 because there is no verified current provider offer or booking/payment integration. It does not create a fictional booking.
- `GET /bookings/my` and `GET /bookings/:id` return persisted booking data for an authenticated owner or administrator.
- `/admin/*` endpoints require an authenticated administrator. Routes support overview metrics, customer records, booking review, price-record review, feedback, road-report moderation, driver-application approval, audit logs, and evidence summaries.
- `PUT /admin/guide-applications/:id/status` accepts `approved` or `rejected`. Approval publishes a directory entry; proximity lookup requires coordinates.
- `PUT /admin/reports/:id/status` accepts `verified_active` or `rejected`. Admin review is not equivalent to verification by an official road authority.
- `POST /admin/ai-query` summarizes persisted search, destination-view, and booking evidence. It is not an AI-generated recommendation.

All sensitive/admin endpoints require the authenticated session. Rate limits apply to API, authentication, route-search, translation, safety, and submission endpoints.
