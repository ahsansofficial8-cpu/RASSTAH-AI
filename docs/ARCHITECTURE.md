# Raastah System Architecture

Raastah is a Vite/React single-page application backed by an Express API. The Express service is deployed separately from the frontend (currently Render for the API and Vercel for the client).

## Persistence

The API uses MongoDB Atlas through Mongoose. `MONGODB_URI` is required at startup; there is no JSON-file fallback. MongoDB is the source of truth for users, bookings, road reports, driver applications, approved drivers, audit events, and the other application collections defined in `server/models.js`.

The `server/scripts/migrate-json-to-mongodb.js` script can import legacy JSON-store records into empty MongoDB collections. It refuses to write to a collection that already contains records. Review the target Atlas database and back up data before running the migration. The migration does not delete the legacy file.

`server/models.js` defines geospatial indexes for nearby approved drivers, cached OpenStreetMap facilities, and road reports. GeoJSON point coordinates use `[longitude, latitude]`.

## External services and data provenance

- **OpenStreetMap, Nominatim, OSRM, and Overpass:** public community services used for geocoding, route estimates, and mapped nearby facilities. Availability, completeness, and usage are not guaranteed. Failures are surfaced; the app does not fabricate fallback places or road conditions.
- **Destination images:** cards read manually maintained direct image URLs from `client/src/data/destinationImages.js`. Empty entries are intentional until real, reusable URLs are supplied. URLs are lazy-loaded by the browser; a failed or empty URL displays a destination-name gradient. The project does not scrape Google Images or assert reuse rights for pasted URLs.
- **Weather:** Open-Meteo.
- **AI assistant and Pocket Guide:** optional server-side OpenAI-compatible chat-completions endpoint configured with `PUBLIC_AI_ENDPOINT` and `PUBLIC_AI_MODEL`; `PUBLIC_AI_API_KEY` may be used when required by the provider. These values stay on the backend. If configuration is absent or the provider fails, the API returns an explicit error/pending status rather than generating a canned answer.
- **Images and video:** optional external media providers, configured independently. A missing or failed provider must not be represented as a real destination photograph.

Road reports submitted by travelers are community reports, not official live road advisories. Admin review state is recorded in MongoDB. Mapped facilities come from OpenStreetMap and may be incomplete or out of date.

## Safety and emergency behavior

The SOS interface requests browser geolocation with user permission and fetches nearby mapped police/hospital features from Overpass. It can provide map links and prepare a user-reviewed share message. Raastah does not contact police, hospitals, emergency contacts, WhatsApp, or SMS automatically. Facility phone links are shown only when a phone value is present in the returned map data.

The UI and API must not imply that browser location, a community report, or an OSM result is a verified emergency response. If Overpass is unavailable, the user receives an explicit unavailable state rather than stale or invented locations.

## Availability and deployment

The Express backend is not a Vercel serverless function in this architecture. Deploy it as a Node web service and deploy the Vite frontend separately. The backend health endpoint returns an unavailable status when MongoDB is disconnected. External-provider failures should be scoped to the feature using that provider; they must not prevent unrelated routes from rendering.

Required backend configuration and deployment checks are documented in [DEPLOYMENT.md](./DEPLOYMENT.md) and [CREDENTIALS.md](./CREDENTIALS.md).

## Deliberately not implemented

There is no offline dead-man's switch or automatic emergency dispatch, offline map-tile download, payment processing, or offline AI model bundled with the application. These require dependable infrastructure, provider credentials, or additional product/security design. The app must not claim these capabilities until implemented and verified.
