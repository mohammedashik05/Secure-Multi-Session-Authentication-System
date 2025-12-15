import { createContext, useEffect, useState } from "react";
import api from "../api/axios";
import { setAccessTokenMemory, getAccessTokenMemory } from "../api/tokenStore";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveAccessToken = (token) => {
    setAccessToken(token);
    setAccessTokenMemory(token);
  };

  const fetchUser = async () => {
    try {
      let token = getAccessTokenMemory();

      // Try refresh ONLY once on app load
      if (!token) {
        const refreshRes = await api.get("/api/auth/refresh", {
          withCredentials: true,
        });

        token = refreshRes.data.accessToken;
        saveAccessToken(token);
      }

      const res = await api.get("/api/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
      saveAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      saveAccessToken(res.data.accessToken);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  const googleLogin = async (credential) => {
    try {
      const res = await api.post("/api/auth/google", { credential });
      saveAccessToken(res.data.accessToken);
      setUser(res.data.user);
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setUser(null);
      saveAccessToken(null);
    }
  };

  useEffect(() => {
    fetchUser(); // ✅ only once
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        googleLogin,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
