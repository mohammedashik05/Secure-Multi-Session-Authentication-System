// src/pages/Dashboard.jsx
import React, { useContext, useState, useEffect } from "react";
import Lottie from "lottie-react";
import dashboardAnimation from "../assets/animations/dashboard.json";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../style/Dashboard.css";
import SecurityAlert from "../components/SecurityAlert";


export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [securityAlert, setSecurityAlert] = useState(null);

  // 🔥 Check if login was suspicious
  useEffect(() => {
    const stored = localStorage.getItem("cybrex_security");
    if (stored) {
      const sec = JSON.parse(stored);
      if (sec.status) setSecurityAlert(sec);

      localStorage.removeItem("cybrex_security");
    }
  }, []);

  return (
    <>
      {/* 🔥 POPUP ALERT */}
      <SecurityAlert
        security={securityAlert}
        onClose={() => setSecurityAlert(null)}
      />

      {/* 🔥 BANNER ALERT */}
      {securityAlert && (
        <div className="security-banner">
          <p>⚠ Suspicious login detected earlier: {securityAlert.reason}</p>
        </div>
      )}

      <div className="dashboard">
        <div className="dashboard-animation">
          <Lottie animationData={dashboardAnimation} loop={true} autoPlay={true} />
        </div>

        <div className="dashboard-container">
          <div className="cybrex-mini-title">CYBREX</div>
          <h1 className="dashboard-title">Welcome, {user?.name}</h1>

          <div className="dashboard-info">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role || "User"}</p>
          </div>

          <div className="dashboard-buttons">
            <button className="btn-primary" onClick={() => navigate("/sessions")}>
              View Active Sessions
            </button>

            <button
              className="btn-secondary"
              onClick={async () => {
                const out = await logout();
                if (out) navigate("/login");
              }}
            >
              Logout
            </button>

          </div>
        </div>
      </div>
    </>
  );
}
