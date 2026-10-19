# Services Directory (`client/src/services/`)

**RAASTAH — THE INTELLIGENT WAY**  
**Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich**

---

## 📌 Overview
The `services` directory contains API integration clients, HTTP interceptors, and data-fetching helpers used by client-side views and context providers.

---

## 🌐 Modules

### `api.js`
- Built on top of **Axios**.
- **Base URL**: Defaults to `import.meta.env.VITE_API_URL` with a local `/api` fallback.
- **Credentials**: `withCredentials: true` is enabled by default to transmit HTTP-only session cookies seamlessly across origins.
- **Interceptors**:
  - Response interceptor automatically unwraps server errors and surfaces clean error messages.
  - Automatically handles 401 unauthorized errors for protected views.
