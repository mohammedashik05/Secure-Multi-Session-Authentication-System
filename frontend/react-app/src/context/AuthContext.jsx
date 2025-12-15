
import { createContext, useEffect, useState } from "react";
import api from "../api/axios";
import { setAccessTokenMemory, getAccessTokenMemory } from "../api/tokenStore";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState();
  const [loading, setLoading] = useState(true);

  
  const saveAccessToken = (token) => {
    setAccessToken(token);
    setAccessTokenMemory(token);
  };

  useEffect(() => {
  const interval = setInterval(async () => {
    try {
      await api.get("/api/auth/me");
    } catch (err) {
    }
  }, 5000); 

  return () => clearInterval(interval);
}, []);


  const fetchUser = async () => {
    try {
      let token = getAccessTokenMemory();

      if (!token) {
        try {
          const refreshRes = await api.get("/api/auth/refresh", {
            withCredentials: true,
          });

          token = refreshRes.data.accessToken;
          if (token) {
            saveAccessToken(token);
          } else {
            setUser(null);
            setLoading(false);
            return;
          }
        } catch (err) {
          setUser(null);
          setLoading(false);
          return;
        }
      }

      const res = await api.get("/api/auth/me");
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Normal login
  const login = async (email, password) => {
    try {
      const res = await api.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      saveAccessToken(res.data.accessToken);
      setUser(res.data.user);

      if (res.data.security) {
        localStorage.setItem(
          "cybrex_security",
          JSON.stringify(res.data.security)
        );
      }

      return { success: true, accessToken: res.data.accessToken };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  // Google login
  const googleLogin = async (credential) => {
    try {
      const res = await api.post(
        "/api/auth/google",
        { credential },
        { withCredentials: true }
      );

      saveAccessToken(res.data.accessToken);
      setUser(res.data.user);

      if (res.data.security) {
        localStorage.setItem(
          "cybrex_security",
          JSON.stringify(res.data.security)
        );
      }

      return { success: true, accessToken: res.data.accessToken };
    } catch (err) {
      return { success: false };
    }
  };

  // Logout (clears cookie + memory)
  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
      saveAccessToken(null);
      return true;
    } catch {
      console.log("Logout failed");
      return false;
    }
  };

  useEffect(() => {
    fetchUser(); 
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        saveAccessToken,
        login,
        googleLogin,
        fetchUser,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
