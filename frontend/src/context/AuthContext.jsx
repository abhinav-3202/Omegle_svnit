import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getMeRequest, loginRequest, registerRequest } from '../api/authApi';
import { TOKEN_STORAGE_KEY } from '../config';

const AuthContext = createContext(null);

const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(readToken())); // restoring a saved session

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setToken(null);
    setUser(null);
  }, []);

  // Restore session from a saved token.
  useEffect(() => {
    if (!token || user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getMeRequest(token)
      .then((profile) => !cancelled && setUser(profile))
      .catch(() => !cancelled && logout())
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token, user, logout]);

  const login = useCallback(async (email, password) => {
    const { token: newToken } = await loginRequest(email, password);
    const profile = await getMeRequest(newToken);
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    } catch {
      /* ignore */
    }
    setToken(newToken);
    setUser(profile);
  }, []);

  const register = useCallback(
    async (form) => {
      await registerRequest(form);
      await login(form.email, form.password);
    },
    [login]
  );

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout }),
    [token, user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
