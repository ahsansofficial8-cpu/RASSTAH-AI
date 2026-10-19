# Credentials and External Service Configuration

The backend reads secrets from its environment. For local development, copy `server/.env.example` to `server/.env`. Do not commit `.env` files, place server credentials in frontend `VITE_*` variables, or share live credentials in issue reports.

## Required

- `MONGODB_URI`: MongoDB Atlas connection URI. Configure Atlas network access and a dedicated database user with only the permissions the app needs. The backend fails to start if this setting is missing; there is no JSON persistence fallback.

## Optional AI provider

- `PUBLIC_AI_ENDPOINT`: HTTPS endpoint implementing the OpenAI Chat Completions request/response format. HTTP is accepted only for localhost during non-production development.
- `PUBLIC_AI_MODEL`: model identifier accepted by the configured endpoint.
- `PUBLIC_AI_API_KEY`: provider key, if required by the endpoint. Keep it server-side.

The AI assistant is disabled until the endpoint and model are configured. Pocket Guide translation uses MyMemory's limited-use free endpoint without AI credentials; phrases are sent to that service and free-tier limits or language-pair availability may apply. Choose an AI provider and model whose pricing, data retention, and usage terms meet your requirements; the app does not provide a bundled offline model or guarantee a free AI provider.

## Local destination media

- Destination images and YouTube video links are read from `client/src/data/pakistan_travel_media_99.json`. The client does not use image-search or YouTube Data API credentials; missing or failed image URLs show a destination-name gradient.

## Public community services

OpenStreetMap Nominatim, OSRM, and Overpass require no private key for the current integration. They are community-operated services with usage policies, rate limits, and no uptime guarantee. Do not treat their data as official, complete, or verified emergency information. If traffic or production usage grows, use a compliant hosted provider or self-hosted instance.

Weather is currently provided by Open-Meteo and does not require an API key for the integrated use.
