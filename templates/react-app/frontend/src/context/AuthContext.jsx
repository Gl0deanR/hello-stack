import { createContext, useContext, useEffect, useState } from "react";

import { api, getToken, setToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, if a token exists, try to load the current user.
  useEffect(() => {
    async function loadUser() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/api/v1/auth/me");
        setUser(data);
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/api/v1/auth/login", { email, password });
    setToken(data.access_token);
    const me = await api.get("/api/v1/auth/me");
    setUser(me.data);
  }

  async function register(email, password, fullName) {
    await api.post("/api/v1/auth/register", {
      email,
      password,
      full_name: fullName || null,
    });
    await login(email, password);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
