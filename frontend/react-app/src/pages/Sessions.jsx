import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../style/Sessions.css";

export default function Sessions() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // FETCH SESSIONS
  // ------------------------------
  const fetchSessions = async () => {
    try {
      const res = await api.get("/api/sessions/my");
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Fetch sessions error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // LOGOUT SINGLE SESSION
  // ------------------------------
  const logoutSession = async (sid) => {
    try {
      const res = await api.delete(`/api/sessions/${sid}`);

      // 🔴 CURRENT SESSION → FORCE LOGOUT
      if (res.data.current === true) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }

      // 🟢 OTHER DEVICE → remove immediately from UI
      setSessions((prev) =>
        prev.filter((session) => session.sessionId !== sid)
      );
    } catch (err) {
      console.error("Logout session error:", err);
    }
  };

  // ------------------------------
  // LOGOUT ALL SESSIONS
  // ------------------------------
  const logoutAll = async () => {
    try {
      await api.delete("/api/sessions/all/logout");
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout all error:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  if (loading) return <h2 className="loading">Loading...</h2>;

  return (
    <div className="sessions-container">
      <div className="cybrex-mini-title">Cybrex</div>

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
              {(s.browser || "Unknown Browser")} •{" "}
              {(s.os || "Unknown OS")}
            </h3>

            <p>
              <b>Device:</b>{" "}
              {s.device && s.device !== "Unknown"
                ? s.device
                : "Local Device"}
            </p>

            <p>
              <b>IP:</b>{" "}
              {s.ipAddress &&
              s.ipAddress !== "::1" &&
              s.ipAddress !== "127.0.0.1"
                ? s.ipAddress
                : "Localhost"}
            </p>

            <p>
              <b>Location:</b>{" "}
              {s.location?.country
                ? `${s.location.city || ""}${
                    s.location.region ? ", " + s.location.region : ""
                  }, ${s.location.country}`
                : "Local Machine"}
            </p>

            <p>
              <b>Created:</b>{" "}
              {new Date(s.createdAt).toLocaleString()}
            </p>

            <p>
              <b>Last Active:</b>{" "}
              {new Date(s.lastActive).toLocaleString()}
            </p>

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
