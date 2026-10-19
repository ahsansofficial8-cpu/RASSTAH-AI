# RAASTAH (راستہ) — Frontend Architecture (`client/`)

**Parent Company:** Apex Wireframe Pvt Ltd  
**Tagline:** THE INTELLIGENT WAY  
**Lead:** Ahsan Warraich  

---

## 📌 Overview
The `client` directory contains the complete Single Page Application (SPA) for **RAASTAH**, built with **React 19**, **Vite**, **Tailwind CSS**, **Framer Motion**, and **GSAP**.

It powers Pakistan's first climate-aware, altitude-intelligent travel planning, discovery, booking, and administrative operations system.

---

## 📂 Directory Structure

```
client/
├── public/                # Static assets (robots.txt, icons, manifests)
├── src/
│   ├── animations/        # GSAP & Framer Motion timeline helpers
│   ├── components/        # Reusable UI widgets, layout components, and travel tools
│   ├── config/            # Central constants, brand tokens, and hotline registry
│   ├── context/           # React context providers (AuthContext)
│   ├── data/              # 59 Pakistani spots database, market price intelligence
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Route-level view components
│   ├── services/          # HTTP API client and external integration layers
│   ├── utils/             # Formatters, elevation math, and currency utilities
│   ├── App.jsx            # Top-level routing layout
│   ├── index.css          # Light-only design system stylesheet
│   └── main.jsx           # Application DOM entry point
├── index.html             # Vite HTML root shell
├── package.json           # Frontend dependencies and npm scripts
├── tailwind.config.js     # Tailwind typography, brand colors, and animations
├── vercel.json            # Vercel SPA rewrites and asset cache headers
└── vite.config.js         # Vite bundler configuration & path aliases (@/)
```

---

## 🛠️ Key Scripts
- `npm run dev`: Launch local Vite development server with HMR on port `5173`.
- `npm run build`: Compile and minify production bundle into `dist/`.
- `npm run preview`: Serve production build locally for pre-flight testing.

---

## 🎨 Theme & Styling System
- Light-only theme (`#FAF8F3` Warm White); system dark-mode preferences do not change the interface.
- Ocean Teal (`#0F766E`) primary brand color with Sunset Orange (`#F97316`) accent.
