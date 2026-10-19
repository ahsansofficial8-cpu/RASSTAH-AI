# Pages Directory (`client/src/pages/`)

**RAASTAH — THE INTELLIGENT WAY**  
**Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich**

---

## 📌 Overview
The `pages` directory houses the top-level route views for the RAASTAH platform. Each file corresponds to one or more routes defined in `client/src/App.jsx`.

---

## 🗺️ Route Index

| File | Route | Description | Clearance |
| :--- | :--- | :--- | :--- |
| `Home.jsx` | `/` | Destination search and planning links | Public |
| `Destinations.jsx` | `/destinations` | Directory of 99 catalogue locations | Public |
| `DestinationDetail.jsx` | `/destination/:slug` | Destination details, attributed media lookup, available live data, and offline dossier | Public |
| `Packages.jsx` | `/packages` | Package availability notice; no current offers listed | Public |
| `PackageDetail.jsx` | `/package/:id` | Unavailable-offer notice; booking disabled | Public |
| `TravelTools.jsx` | `/tools` | Quote calculator, transport options, traveler reports, elevation, packing, and SOS | Public |
| `ItineraryPlanner.jsx` | `/planner` | Multi-day custom trip builder | Public |
| `MoodMatcher.jsx` | `/vibe-matcher` | Vibe and budget travel discovery quiz | Public |
| `Guides.jsx` | `/guides` | Local 4x4 mountain drivers and licensed guides | Public |
| `GroupTrip.jsx` | `/group-trips` | Fixed-departure community expeditions | Public |
| `Blog.jsx` | `/blog` | Travel intelligence guides & high-altitude road logs | Public |
| `Login.jsx` | `/login` | Customer sign-in with 1-click demo accounts | Public |
| `Register.jsx` | `/register` | Account registration with altitude preference survey | Public |
| `ForgotPassword.jsx` | `/forgot-password` | Self-service credential recovery flow | Public |
| `BookingCheckout.jsx` | `/checkout/:id` | Multi-step booking checkout & CNIC verification | Authenticated |
| `BookingConfirmation.jsx` | `/booking-confirmed/:id` | Post-payment invoice & voucher summary | Authenticated |
| `MyTrips.jsx` | `/my-trips` | Customer travel portal, voucher PDF print, feedbacks | Authenticated |
| `AdminLogin.jsx` | `/admin/login` | Super Admin gateway with master clearance | Public |
| `AdminDashboard.jsx` | `/admin` | Operations Command Center (bookings, prices, AI query) | Super Admin |

---

## 📝 Guidelines for Adding New Pages
1. Wrap every page root in `<PageWrapper>` from `@/components/layout/PageWrapper` to ensure proper layout padding and top-level animations.
2. Register the route in `client/src/App.jsx`.
3. Add navigation links to `Navbar.jsx` or `Footer.jsx` if applicable.
