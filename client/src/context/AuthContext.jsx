import { createContext, useContext, useEffect, useState } from 'react';
import { authService, setAuthToken, getAuthToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: if a token exists, validate it against /api/auth/me.
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .me()
      .then(setUser)
      .catch(() => setAuthToken(null)) // expired/invalid token → clear it
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const updateUser = (patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}