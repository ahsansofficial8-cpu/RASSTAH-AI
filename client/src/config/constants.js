/**
 * ==============================================================================
 * RAASTAH (راستہ) — THE INTELLIGENT WAY
 * Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich
 * ==============================================================================
 * FILE: constants.js
 * PATH: client/src/config/constants.js
 * PURPOSE: Global frontend brand constants, API routing parameters, emergency hotlines,
 *          theme design tokens, and application routes.
 * LAST UPDATED: October 2026
 * ==============================================================================
 */

export const BRAND = {
  NAME: 'RAASTAH',
  URDU_NAME: 'راستہ',
  TAGLINE: 'THE INTELLIGENT WAY',
  COMPANY: 'Apex Wireframe Pvt Ltd',
  LEAD: 'Ahsan Warraich',
  VERSION: '2.4.0',
  SUPPORT_EMAIL: 'support@raastah.pk',
  CONTACT_PHONE: '+92 300 1234567'
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const THEME_COLORS = {
  OCEAN_TEAL: '#0F766E',
  SUNSET_ORANGE: '#F97316',
  WARM_WHITE: '#FAF8F3',
  CHARCOAL_NAVY: '#17212B',
  TEAL_ACCENT: '#2DD4BF',
  GOLD_ACCENT: '#E5983A'
};

export const EMERGENCY_HOTLINES = [
  { name: 'Rescue 1122 (Medical & Fire)', phone: '1122', category: 'emergency' },
  { name: 'National Highway & Motorway Police', phone: '130', category: 'highway' },
  { name: 'Gilgit-Baltistan Tourist Police', phone: '1422', category: 'tourist' },
  { name: 'National Disaster Management (NDMA)', phone: '1129', category: 'disaster' },
  { name: 'KPK Tourism Helpline (KITE)', phone: '1422', category: 'tourist' }
];
