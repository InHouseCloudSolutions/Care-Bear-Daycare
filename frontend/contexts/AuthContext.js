'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { authLogin, authMe, getMyProfile, registerPetParent } from '@/lib/daycareApi';
import { readStorageItem, removeStorageItem, writeStorageItem } from '@/utils/safeStorage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/** localStorage key for the Care Bear Daycare DRF token. */
const TOKEN_KEY = 'cb_daycare_token';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [petParent, setPetParent] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    removeStorageItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setPetParent(null);
  }, []);

  /** Loads /auth/me/ and /daycare/me/ for a token. Clears auth on 401 from either call. */
  const loadProfiles = useCallback(
    async currentToken => {
      const [meRes, parentRes] = await Promise.all([
        authMe(currentToken),
        getMyProfile(currentToken),
      ]);

      if (meRes.status === 401 || parentRes.status === 401) {
        clearAuth();
        return false;
      }

      setUser(meRes.ok ? meRes.data : null);
      setPetParent(parentRes.ok ? parentRes.data : null);
      return true;
    },
    [clearAuth],
  );

  useEffect(() => {
    const stored = readStorageItem(TOKEN_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    setToken(stored);
    loadProfiles(stored).finally(() => setLoading(false));
  }, [loadProfiles]);

  const login = useCallback(
    async (email, password) => {
      const res = await authLogin(email, password);
      if (!res.ok || !res.data?.token) {
        return res;
      }
      const nextToken = res.data.token;
      writeStorageItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
      await loadProfiles(nextToken);
      return res;
    },
    [loadProfiles],
  );

  const register = useCallback(async payload => {
    const res = await registerPetParent(payload);
    if (!res.ok || !res.data?.token) {
      return res;
    }
    const nextToken = res.data.token;
    writeStorageItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setPetParent(res.data.pet_parent ?? null);
    const meRes = await authMe(nextToken);
    setUser(meRes.ok ? meRes.data : null);
    return res;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const refreshAuth = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    await loadProfiles(token);
    setLoading(false);
  }, [token, loadProfiles]);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      user,
      petParent,
      token,
      groups: [],
      permissions: [],
      loading,
      csrfToken: '',
      login,
      register,
      logout,
      refreshAuth,
    }),
    [user, petParent, token, loading, login, register, logout, refreshAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
