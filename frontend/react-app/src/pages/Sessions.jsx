import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";     // 🔥 import navigate
import "../style/Sessions.css";

const API = import.meta.env.VITE_API_URL;

export default function Sessions() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate(); // 🔥 for back button

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API}/api/sessions/my`, {
        withCredentials: true,
      });
      setSessions(res.data.sessions);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const logoutSession = async (sid) => {
    try {
      const res = await axios.delete(`${API}/api/sessions/${sid}`, {
        withCredentials: true,
      });

      if (res.data.state === "cur") {
        // console.log("kello")
        navigate("/login")
        return;
      }
      // Refresh sessions for other devices
      await fetchSessions();
    } catch (err) {
      console.error(err);
    }
  };


  const logoutAll = async () => {
    try {
      await axios.delete(`${API}/api/sessions/all/logout`, {
        withCredentials: true,
      });
      navigate("/login")
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  if (loading) return <h2 className="loading">Loading...</h2>;

  return (
    <div className="sessions-container">
      {/* 🔙 BACK BUTTON */}
      <button className="back-btn" onClick={() => navigate("/")}>
        ⬅ Back
      </button>

      <h1>Your Active Sessions</h1>

      <button className="logout-all-btn" onClick={logoutAll}>
        Logout All Devices
      </button>

      {sessions.length === 0 ? (
        <p>No active sessions found.</p>
      ) : (
        sessions.map((s) => (
          <div key={s.sessionId} className="session-card">
            <h3>{s.browser} • {s.os}</h3>

            <p><b>Device:</b> {s.device}</p>
            <p><b>IP:</b> {s.ipAddress}</p>
            <p><b>Created:</b> {new Date(s.createdAt).toLocaleString()}</p>
            <p><b>Last Active:</b> {new Date(s.lastActive).toLocaleString()}</p>

            {s.sessionId === user?.sid ? (
              <span className="current-device">This Device</span>
            ) : (
              <button
                className="logout-btn"
                onClick={() => logoutSession(s.sessionId)}
              >
                Logout This Device
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
