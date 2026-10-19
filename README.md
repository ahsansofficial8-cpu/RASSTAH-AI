# RAASTAH (راستہ) — The Intelligent Way 🇵🇰
### Pakistan's Premier Climate-Aware, Altitude-Intelligent Travel & Expedition Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-v20%2B-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19.0-blue)](https://react.dev/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-orange)](https://aistudio.google.com/)
[![License](https://img.shields.io/badge/License-Proprietary-teal)]()

---

## 🏔️ Executive Summary

**RAASTAH (`راستہ`)** is a next-generation travel intelligence and expedition operating system engineered specifically for Pakistan's rugged alpine geography, high-altitude passes, and diverse cultural corridors. 

Traditional global travel platforms fail in Pakistan because they lack hyper-local topological intelligence: they cannot predict whether Babusar Pass is open under snow, they don't know the exact 4x4 jeep union tariffs from Raikot Bridge to Fairy Meadows, and they provide zero carrier coverage guidance across SCOM 4G, Zong, and Jazz in Gilgit-Baltistan and Khyber Pakhtunkhwa.

**RAASTAH solves this completely** by fusing real-time satellite meteorology, OpenStreetMap topological routing, Google Gemini generative AI, and a verified network of local mountain drivers and alpine guides into a single cinematic platform.

---

## ✨ Core Innovations & Feature Suite

### 1. 🤖 Raastah AI Expedition Copilot (Google Gemini Multi-Tier)
- **Natural Language Tour Guide**: Powered by Google's latest Gemini Flash models (`gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.5-flash`) with dynamic failover.
- **50/50 Diversion Engine**: Engages naturally with travelers on any topic, expertly guiding conversations back toward Pakistan's breathtaking travel opportunities.
- **Context-Aware Intent Action System**: Returns executable actions directly in chat—clicking an action button navigates travelers instantly to routes, weather forecasts, or verified 4x4 drivers.
- **Vibe Matcher**: Multi-step interactive dialogue helping indecisive travelers pinpoint their dream expedition (trekking, relaxation, cultural immersion, or high-altitude challenge).

### 2. 🗺️ Interactive 4x4 Driver, Package & Destination Hub Map
- **Unified Pakistan Geo-Canvas**: Interactive Leaflet/OpenStreetMap visualizer plotting:
  - **Verified 4x4 Mountain Drivers**: Real local drivers with verified vehicles (Prados, Land Cruisers, Revo 4WD, Hiace Grand Cabins), phone numbers, and WhatsApp links.
  - **All-Inclusive Tour Packages**: Skardu, Hunza, Fairy Meadows, and Swat expeditions with transparent PKR pricing.
  - **Topographic Destination Hubs**: All 99 catalogued destinations across Gilgit-Baltistan, KPK, Azad Kashmir, Punjab, Balochistan, and Sindh.
- **Proximity Geolocation Engine**: Live browser GPS + OpenStreetMap Nominatim reverse geocoding calculates exact Haversine distance in kilometers and surfaces the nearest operators.

### 3. 🛡️ Women-Safe Expedition Mode
- Dedicated security filter vetted for solo female travelers and family caravans.
- Instantly isolates operators verified for safe conduct, accompanied family groups, and verified security credentials.

### 4. 🧭 99 Destination Smart Intelligence Dossiers
- **Dynamic 12-Month Seasonal Matrix**: Altitude and weather-aware visual calendar showing Green (Open & Prime), Yellow (Caution/Shoulder), and Red (Closed/Snowbound) states.
- **Altitude-Tailored Suitability**: Automatic health and acclimatization advisories based on elevation meters (warnings for infants/elderly above 3,000m).
- **Jeep Union Logistics & Tariffs**: Explicit standard rates for treacherous tracks (e.g., Tattu village jeep track, Deosai plateau crossing, Mahodand Lake).
- **Cellular Network Intelligence**: Hyper-local carrier breakdowns across SCOM 4G, Zong, and Jazz.
- **Fuel & Logistics Planning**: Nearest PSO/Shell stations, Euro-5 diesel availability, and emergency Jerrycan requirements for long passes.
- **Destination-Specific FAQ Engine**: Dynamically contextualized FAQs tailored to each region and terrain.

### 5. ⚡ 1-Click AI Trip Planner
- Instant custom itinerary generation powered by Gemini structured JSON outputs.
- Returns comprehensive day-by-day itineraries with time allocations, recommended activities, PKR cost estimates, and packing essentials.

### 6. 🌦️ 100% Real-Time Live Weather & Motorway Alerts
- **Open-Meteo Integration**: Live temperature, apparent heat index, relative humidity, wind speed, surface pressure, and UV index for exact destination coordinates.
- **Fog & Smog Safety Network**: Live visibility advisories for M-2, M-3, M-4, and M-5 motorways with safety protocols.

### 7. 📱 Offline Travel Packs & Emergency Helplines
- Single-click PDF and JSON offline dossiers designed for remote mountain zones without cellular service.
- 1-tap quick dialers for Rescue 1122, Police 15, Motorway Police 130, Tourist Police 1422, and Women's Helpline 1094.

### 8. 🛡️ Super Admin Command Center
- Full-spectrum administrative governance dashboard for reviewing driver applications, managing traveler bookings, reviewing audit logs, and supervising live platform traffic.

---

## 🛠️ Technology Architecture

| Layer | Technologies & Libraries |
|---|---|
| **Frontend Framework** | React 19, Vite 8, React Router v7 |
| **Styling & Animation** | Tailwind CSS v4, Framer Motion, GSAP, Lucide React Icons |
| **Cartography & Maps** | Leaflet, React-Leaflet, OpenStreetMap CartoDB Tiles |
| **Backend Engine** | Node.js v20+, Express 5, CORS, Helmet, Express-Rate-Limit |
| **Database & ORM** | MongoDB Atlas Cloud, Mongoose |
| **Artificial Intelligence**| Google Gemini API (`gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.5-flash`) |
| **Meteorology & Geo APIs** | Open-Meteo API, OpenStreetMap Nominatim, OSRM Routing Engine |
| **Cultural & Utility APIs** | Aladhan Prayer Times API, ExchangeRate-API (PKR Live Conversion) |
| **Security & Auth** | JSON Web Tokens (JWT), BCrypt password hashing, HTTP-only Cookies |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v20 or higher
- **npm** or **yarn**
- **MongoDB Atlas** cluster URL or local MongoDB instance

### 2. Backend Setup
```bash
# Navigate to backend directory
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

Edit `server/.env` with your settings:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:
```bash
npm start
```
*Server will listen on `http://localhost:5000` with automated super-admin provisioning.*

### 3. Frontend Setup
```bash
# In a new terminal, navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```
*Client will be available at `http://localhost:5173`.*

---

## 👥 User Roles & Portal Access Rules (Client vs. Admin)

RAASTAH enforces clear role-based access control (RBAC) across the public traveler experience and the administrative operations center:

### 🎒 Client Portal Rules
| Capability | Access Level | Description & Enforcement |
|---|---|---|
| **Browse Destinations & Routes** | Public / All Users | Explore 99 destinations, live weather, passes, tariffs, and FAQs freely. |
| **Raastah AI Chatbot & Vibe Matcher** | Public / All Users | Full conversational tour copilot and multi-tier interactive itinerary planning. |
| **Travel Tools & Helplines** | Public / All Users | Live weather, fuel calculator, prayer times, emergency dialers, offline packs. |
| **Save to Wishlist** | Public / Client | Bookmark favorite high-altitude destinations for future planning. |
| **View Driver Direct Contact** | 🔒 Logged-In Clients Only | Direct driver phone & WhatsApp numbers are hidden behind client authentication to protect driver privacy. |
| **Book Expeditions & Checkout** | 🔒 Logged-In Clients Only | Clients must authenticate before confirming reservations or allocating 4x4 convoys. |
| **Submit Reviews & Feedback** | 🔒 Confirmed Booking Required | Travelers can only submit ratings and feedback from their account if they have at least one confirmed expedition booking. |

### 🛡️ Super Admin Portal Rules
| Capability | Access Level | Description & Enforcement |
|---|---|---|
| **Registered Client Directory** | 🛡️ Admin Only | View all registered client profiles, booking frequency, total expenditure, and full journey logs. |
| **Live Expeditions & Dispatch** | 🛡️ Admin Only | Review, verify, assign 4x4 drivers, and manage expedition statuses (Confirmed / Cancelled). |
| **Driver Verification & Approvals** | 🛡️ Admin Only | Approve new driver applications, verify official driving licenses (`✓ License Verified`), and endorse `🛡️ Women-Safe` certifications with real-time site sync. |
| **Feedback Moderation Queue** | 🛡️ Admin Only | Read all submitted traveler reviews, approve them to publish live on the public site, or reject inappropriate submissions. |
| **Crowdsourced Pass Reports** | 🛡️ Admin Only | Verify or dismiss crowdsourced road hazard and avalanche alerts before publishing official travel advisories. |
| **AI Strategic Intelligence** | 🛡️ Admin Only | Query the Google Gemini fleet intelligence engine for route capacity, revenue forecasts, and corridor dispatch planning. |
| **Immutable Audit Log** | 🛡️ Admin Only | View full administrative trail of all system state changes, approvals, and credential actions. |

---

## 🔐 Credentials & Portal Authentication

### 1. Super Admin Clearance
- **Admin Portal Route**: `/admin-login` or `/admin`
- **Username / Email**: `admin` or `admin@raastah.pk`
- **Password**: `ahsan2008`
- *Full administrative command authority over all drivers, reviews, bookings, and platform metrics.*

### 2. Client / Traveler Clearance
- **Client Route**: `/login` or `/register`
- **New Account**: Self-register on `/register` (dynamic GPS auto-detection for home city, clean form inputs)
- **Demo Client Account**:
  - **Email**: `traveler@raastah.pk`
  - **Password**: `Traveler@2026`
- *Access confirmed booking histories, leave reviews, and unlock direct driver contact.*

---

## 🧪 Automated Testing & Build Validation

```bash
# Run server test suite (11/11 tests)
cd server
node --test

# Run client production build
cd client
npm run build
```

---

## 👨‍💻 Project Lead & Contact

Developed with pride for Pakistan's travel and mountaineering community.

- **Lead Engineer & Designer**: Ahsan Warraich
- **Company**: Apex Wireframe Pvt Ltd
- **Email**: [ahsansofficial8@gmail.com](mailto:ahsansofficial8@gmail.com)
- **WhatsApp**: [+92 343 6030463](https://wa.me/923436030463)
- **LinkedIn**: [Ahsan Warraich](https://www.linkedin.com/in/ahsan-warraich-1ab016405/)

---

© 2026 **RAASTAH — Apex Wireframe Pvt Ltd**. All rights reserved.  
*راستہ — محفوظ سفر، محفوظ پاکستان*
