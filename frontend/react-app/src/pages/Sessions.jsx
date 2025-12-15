import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";     

export default function Sessions() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      //  use api, token auto-attached by interceptor
      const res = await api.get("/api/sessions/my");
      setSessions(res.data.sessions);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

 const logoutSession = async (sid) => {
  try {
    const res = await api.delete(`/api/sessions/${sid}`);

    if (res.data.status === "cur") {
      await logout();
      navigate("/login");
      return;
    }

    fetchSessions();
  } catch (err) {
    console.error(err);
  }
};



  const logoutAll = async () => {
    try {
      await api.delete("/api/sessions/all/logout");
      // Also clear local auth state
      await logout();
      navigate("/login");
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
      <div className="cybrex-mini-title">Cybrex</div>
      {/*  BACK BUTTON */}
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
            <h3>
              {s.browser} • {s.os}
            </h3>

            <p>
              <b>Device:</b> {s.device}
            </p>
            <p>
              <b>IP:</b> {s.ipAddress}
            </p>
            <p>
              <b>Created:</b> {new Date(s.createdAt).toLocaleString()}
            </p>
            <p>
              <b>Last Active:</b> {new Date(s.lastActive).toLocaleString()}
            </p>

            {/* We don't actually know current sid on frontend (httpOnly cookie),
                so we just show a Logout button for all sessions.
                Backend handles whether it's current or not. */}
            <button
              className="logout-btn"
              onClick={() => logoutSession(s.sessionId)}
            >
              Logout This Device
            </button>
          </div>
        ))
      )}
    </div>
  );
}
