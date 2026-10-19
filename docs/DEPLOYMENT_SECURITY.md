# RAASTAH (راستہ) — Deployment Security & Hardening Protocols

**Parent Company:** Apex Wireframe Pvt Ltd  
**Tagline:** THE INTELLIGENT WAY  
**Lead:** Ahsan Warraich  

---

## 1. Security Baseline & Standards
RAASTAH implements enterprise-grade defense-in-depth protections tailored for travel and financial booking platforms operating in Pakistan.

---

## 2. Implemented Security Controls

### 2.1. Rate Limiting Protection
Implemented via `express-rate-limit` on the Express backend:
- **General API Limiter (`/api/`)**:
  - `windowMs`: 1 minute (60,000 ms)
  - `max`: 120 requests per IP address
  - Standard headers returned (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`)
- **Authentication Limiter (`/api/auth/`)**:
  - `windowMs`: 15 minutes (900,000 ms)
  - `max`: 15 requests per IP address
  - Mitigates credential stuffing and brute-force attacks against customer accounts.

### 2.2. HTTP Header Protections
Enforced through `helmet` on the backend and `vercel.json` on the frontend:
- `X-Frame-Options: DENY`: Complete clickjacking prevention.
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
- `X-XSS-Protection: 1; mode=block`: Legacy browser XSS defense.
- `Referrer-Policy: strict-origin-when-cross-origin`: Restricts referrer data leakage.

### 2.3. Cross-Origin Resource Sharing (CORS) Hardening
- Origin whitelist strictly restricted to:
  - `http://localhost:5173` (Vite dev default)
  - `http://localhost:5174` (Secondary dev port)
  - `http://localhost:3000` (Alternative client port)
  - `https://raastah.vercel.app` (Production frontend)
  - Explicit environment override via `CLIENT_URL`
- `credentials: true` enabled safely with explicit origin validation.

### 2.4. Credential & Password Security
- Passwords hashed using `bcryptjs` with salt factor 10.
- Raw passwords are never persisted to disk or emitted in API responses or logs.
- Super Admin clearance enforced on all `/api/admin/*` routes via `requireAdmin` middleware.

---

## 3. Data Sanitization & CNIC Privacy
- Customer National Identity Card (CNIC) numbers conform to standard Pakistani NADRA formatting (`XXXXX-XXXXXXX-X`).
- Emergency SOS geolocation coordinates are processed client-side without permanent tracking cookies.
