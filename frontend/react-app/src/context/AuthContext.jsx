// src/context/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

const API = import.meta.env.VITE_API_URL;

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API}/api/auth/me`, {
        withCredentials: true,
      });
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
    } catch (err) {
      console.log("Logout failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, fetchUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
