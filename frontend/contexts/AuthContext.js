'use client';

import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const EMPTY_AUTH = {
  isAuthenticated: false,
  user: null,
  groups: [],
  permissions: [],
  loading: false,
  csrfToken: '',
  refreshAuth: async () => {},
};

export const AuthProvider = ({ children }) => {
  const value = useMemo(() => EMPTY_AUTH, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
