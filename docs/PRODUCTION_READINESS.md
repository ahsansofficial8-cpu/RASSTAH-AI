# RAASTAH — Production Readiness

**Status:** Not certified for production. MongoDB Atlas and AI credentials have not been configured or verified in this workspace. Validate each provider, deployment setting, and operational process in the target environment before release.

## Current data boundaries

- Destination descriptions and approximate center coordinates come from the local catalogue; they are not navigation-grade or safety data.
- Weather is fetched from Open-Meteo when available. Live values are not guaranteed.
- Route distance and duration are OpenStreetMap/Nominatim and OSRM estimates, not live traffic or road-condition reports.
- Community road reports remain unverified until an administrator reviews them. Admin review does not make a report an official road authority advisory.
- Destination photos are external search matches. Their accuracy and usage rights require independent review.
- No verified package offers, current operator prices, official road feed, or carrier-coverage feed are configured. The UI must show unavailable states rather than estimates presented as offers.
- Driver and guide applications are private until an administrator approves publication. The app does not collect or independently verify identity documents.
- Shared demo credentials must not be used. Provision accounts through the deployment operator's trusted process and keep secrets out of source control.
- MongoDB Atlas is required at backend startup; there is no JSON runtime fallback. The legacy migration script is opt-in and must be run only after reviewing and backing up the source and target databases.
- Automated tests do not establish live integration with Atlas, Overpass, Nominatim, OSRM, Open-Meteo, YouTube embeds, or an AI provider.

## Release checks

Before deployment, confirm:

1. `npm --prefix server test` and `npm --prefix client run build` succeed.
2. `node --check` passes for the backend, models, and migration script.
3. The deployment uses a least-privilege MongoDB Atlas user, unique secrets, production CORS origins, HTTPS, and a tested backup/restore procedure.
4. Every enabled external provider is configured, attribution/licensing is reviewed, and unavailable-provider behavior is checked.
5. Admin credentials and approval workflows are verified in the target environment.

Passing these checks does not establish safety, legal compliance, or production readiness for any external provider or travel advisory.
