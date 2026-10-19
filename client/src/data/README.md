# Data directory

`pakistan59Locations.js` exports the 99-entry destination catalogue, including 40 supplemental entries. Catalogue coordinates are approximate and should be verified before navigation. Unverified ratings, package prices, lodging, and meal claims are not seeded.

`pakistan_travel_media_99.json` contains the local destination image lists and YouTube watch URLs, keyed by normalized destination names. `destinationImages.js` maps those records to catalogue IDs, randomly rotates among available images on page load and destination searches, and validates YouTube links before embedding them. Missing or failed image URLs use the destination-name gradient fallback.

`destinationIntelligence.js` supplies catalogue context and neutral unavailable states. It does not synthesize current weather, route conditions, prices, reviews, facilities, operator profiles, or seasonal openings.

Live service lookups are in `../components/destinations/LiveDataPanel.jsx`. Weather comes from Open-Meteo, driving routes from OSRM, currency from ExchangeRate-API Open Access, mapped facilities from OpenStreetMap Overpass, prayer times from Aladhan, and community road reports from the backend. Reports are unverified and expire from public view after 72 hours; they are not official road status. OGRA fuel pricing, hotel/food costs, and carrier connectivity remain unavailable rather than being replaced by estimates.
