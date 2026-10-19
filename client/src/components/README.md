# Components Directory (`client/src/components/`)

**RAASTAH — THE INTELLIGENT WAY**  
**Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich**

---

## 📌 Overview
This directory contains modular React UI components organized into four specialized subdirectories:

1. `ui/`: Primitive reusable interface widgets (Buttons, Cards, Inputs, Badges, Modals, Skeleton Loaders, ErrorBoundary).
2. `layout/`: Global framing components (Navbar, Footer, BottomNav for mobile, PageWrapper).
3. `tools/`: Interactive travel intelligence features (MultiModalPlanner, MotorwayFogAlerts, EmergencySOS).
4. `destinations/`: Destination exploration widgets (SpotCard, VideoGalleryModal, ElevationChart).

---

## 🏗️ Architectural Rules
- **Component Isolation**: Components must accept styling overrides via `className` props using Tailwind merge or template strings.
- **Theme Aware**: Use design system CSS custom properties or theme classes (`bg-surface`, `text-body`, `border-theme`) rather than hardcoded colors.
- **Accessibility**: Include ARIA labels, semantic HTML elements, and keyboard navigability.
- **Export Pattern**: Primitive UI components in `ui/` are exported through `client/src/components/ui/index.js` for clean barrel imports:
  ```jsx
  import { Button, Card, Badge, Input } from '@/components/ui';
  ```
