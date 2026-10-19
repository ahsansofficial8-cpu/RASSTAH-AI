# RAASTAH (راستہ) — Changelog & Release Milestones

**Parent Company:** Apex Wireframe Pvt Ltd  
**Tagline:** THE INTELLIGENT WAY  
**Lead:** Ahsan Warraich  

All notable changes to the RAASTAH platform are documented in this file.

---

## [Version 2.4.0] — October 2026 (Production Hardening)

### Persistence and live-data corrections
- Replaced the JSON-backed runtime store with required MongoDB Atlas persistence through Mongoose. Added a one-time JSON migration that refuses to overwrite populated collections; no sample records are created.
- Added MongoDB geospatial indexes and live OpenStreetMap Overpass lookup for nearby mapped police stations and hospitals. Results are source data, not a verified or complete emergency directory.
- Road reports are persisted and labeled for admin review; they are community-submitted and are not an official road-status feed.
- SOS location sharing prepares user-reviewed map/share links only. It does not automatically contact emergency services, WhatsApp, or emergency contacts.
- Replaced canned AI/chat responses with an optional server-configured OpenAI-compatible endpoint. Missing configuration is reported as unavailable.

### 🚀 Added Features
- **Multi-Modal Route Planner**: Provides an OSRM road estimate when the routing provider is available; this is not live traffic or a verified transit schedule/price.
- **Motorway Fog & Weather Advisory**: Real-time crowd-sourced and meteorological visibility monitoring across M-2, M-3, M-5, and Hazara Motorway (M-15).
- **Emergency location sharing**: User-approved browser geolocation with nearby OpenStreetMap results and share links; no automatic emergency dispatch.
- **Light-Only Design System**: Light theme is enforced independently of the device color preference.
- **Verified Pakistani Spots**: Expanded to 59 fully documented spots with GPS coordinates, elevation metrics, and authentic YouTube documentary embeds.
- **Centralized Constants & Blueprints**: Added `server/config/constants.js`, `client/src/config/constants.js`, `render.yaml`, and `client/vercel.json`.
- **System Health Monitor**: `/api/health` reports service health and returns an unavailable status when the required MongoDB connection is down.

### 🛡️ Security & Performance Enhancements
- **Authentication UX**: Removed prefilled and publicly documented shared demo credentials.
- **Rate Limiting**: Enforced 120 req/min general API limits and 15 attempts/15 min on authentication routes using `express-rate-limit`.
- **CORS Hardening**: Explicit whitelist supporting development ports and production Vercel domains with `credentials: true`.
- **SPA Rewrites & Caching**: Added `vercel.json` SPA rewrite rules and 1-year immutable caching for static assets.
- **Production Asset Cleanup**: Purged unused boilerplate assets and created thorough `.gitignore` files.

### 📚 Documentation Suite
- Added comprehensive documentation in `docs/`:
  - `docs/ARCHITECTURE.md`
  - `docs/API.md`
  - `docs/DEPLOYMENT.md`
  - `docs/DEPLOYMENT_SECURITY.md`
  - `docs/CREDENTIALS.md`
  - `docs/TESTING.md`
  - `docs/PRODUCTION_READINESS.md`
