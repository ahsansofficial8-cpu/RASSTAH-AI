/**
 * ==============================================================================
 * RAASTAH (راستہ) — THE INTELLIGENT WAY
 * Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich
 * ==============================================================================
 * FILE: AuthContext.jsx
 * PATH: client/src/context/AuthContext.jsx
 * PURPOSE: Global React Context provider managing authentication state, session hydration,
 *          user sign-in, account registration, profile updates, and sign-out.
 * LAST UPDATED: October 2026
 * ==============================================================================
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const authRequestId = useRef(0);

  // Hydrate from server on mount with localStorage cached fallback
  useEffect(() => {
    const requestId = authRequestId.current;
    api.get('/auth/me')
      .then(({ data }) => {
        if (authRequestId.current === requestId && data?.user) {
          setUser(data.user);
          try { localStorage.setItem('raastah-cached-user', JSON.stringify(data.user)); } catch {}
        }
      })
      .catch(() => {
        if (authRequestId.current === requestId) {
          try {
            const cached = localStorage.getItem('raastah-cached-user');
            if (cached) {
              setUser(JSON.parse(cached));
            } else {
              setUser(null);
            }
          } catch {
            setUser(null);
          }
        }
      })
      .finally(() => {
        if (authRequestId.current === requestId) setLoading(false);
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const lowerEmail = (email || '').trim().toLowerCase();
    try {
      const { data } = await api.post('/auth/login', { email: lowerEmail, password });
      authRequestId.current += 1;
      setUser(data.user);
      setLoading(false);
      try { localStorage.setItem('raastah-cached-user', JSON.stringify(data.user)); } catch {}
      return data.user;
    } catch (err) {
      // 1. Fixed Super Admin Authentication Fallback
      if ((lowerEmail === 'admin' || lowerEmail === 'admin@raastah.pk') && password === 'ahsan2008') {
        const adminUser = {
          id: 'admin_fixed_super',
          name: 'Ahsan Warraich (Super Admin)',
          email: 'admin@raastah.pk',
          role: 'admin',
          city: 'Islamabad'
        };
        authRequestId.current += 1;
        setUser(adminUser);
        setLoading(false);
        try { localStorage.setItem('raastah-cached-user', JSON.stringify(adminUser)); } catch {}
        return adminUser;
      }

      // 2. Fixed Pre-Seeded Client / Demo Traveler Account Fallback
      if (lowerEmail === 'user@raastah.pk' || lowerEmail === 'traveler@raastah.pk' || lowerEmail === 'demo@raastah.pk') {
        const clientUser = {
          id: 'usr_demo_traveler',
          name: 'Fatima Noor (Verified Traveler)',
          email: lowerEmail,
          role: 'user',
          phone: '+92 300 1122334',
          city: 'Islamabad'
        };
        authRequestId.current += 1;
        setUser(clientUser);
        setLoading(false);
        try { localStorage.setItem('raastah-cached-user', JSON.stringify(clientUser)); } catch {}
        return clientUser;
      }

      // 3. Registered Accounts in Local Storage Fallback
      try {
        const localAccounts = JSON.parse(localStorage.getItem('raastah-registered-users') || '[]');
        const matched = localAccounts.find(u => u.email.toLowerCase() === lowerEmail);
        if (matched && (!matched.password || matched.password === password)) {
          const userObj = {
            id: matched.id || `usr_${Date.now()}`,
            name: matched.name,
            email: matched.email,
            role: 'user',
            phone: matched.phone || '',
            city: matched.city || 'Islamabad'
          };
          authRequestId.current += 1;
          setUser(userObj);
          setLoading(false);
          try { localStorage.setItem('raastah-cached-user', JSON.stringify(userObj)); } catch {}
          return userObj;
        }
      } catch {}

      throw err;
    }
  }, []);

  const register = useCallback(async (name, email, password, phone, city) => {
    const lowerEmail = (email || '').trim().toLowerCase();
    const newAccount = {
      id: `usr_${Date.now()}`,
      name: (name || '').trim(),
      email: lowerEmail,
      password,
      phone: phone || '',
      city: city || 'Islamabad'
    };

    // Always store registered account locally for instant login
    try {
      const existing = JSON.parse(localStorage.getItem('raastah-registered-users') || '[]');
      const filtered = existing.filter(u => u.email.toLowerCase() !== lowerEmail);
      filtered.push(newAccount);
      localStorage.setItem('raastah-registered-users', JSON.stringify(filtered));
    } catch {}

    try {
      const { data } = await api.post('/auth/register', { name, email: lowerEmail, password, phone, city });
      authRequestId.current += 1;
      return data.user;
    } catch {
      // Return local account if remote API had network glitch
      return newAccount;
    }
  }, []);

  const logout = useCallback(async () => {
    authRequestId.current += 1;
    try {
      await api.post('/auth/logout');
    } catch {}
    setUser(null);
    setLoading(false);
    try { localStorage.removeItem('raastah-cached-user'); } catch {}
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      try { localStorage.setItem('raastah-cached-user', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export default AuthContext;
