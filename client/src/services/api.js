/**
 * ==============================================================================
 * RAASTAH (راستہ) — THE INTELLIGENT WAY
 * Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich
 * ==============================================================================
 * FILE: api.js
 * PATH: client/src/services/api.js
 * PURPOSE: Central Axios HTTP client configured with credentials, JSON headers,
 *          base URL resolution, and unified error handling interceptors.
 * LAST UPDATED: October 2026
 * ==============================================================================
 */

import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
const baseURL = configuredBaseUrl
  ? configuredBaseUrl.endsWith('/api')
    ? configuredBaseUrl
    : `${configuredBaseUrl}/api`
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response?.data?.message || error.message || 'Something went wrong');
  }
);

export default api;
