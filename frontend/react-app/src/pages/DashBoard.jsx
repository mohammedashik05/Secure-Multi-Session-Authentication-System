// src/pages/Dashboard.jsx
import React, { useContext } from "react";
import Lottie from "lottie-react";
import dashboardAnimation from "../assets/animations/dashboard.json";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../style/Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <>
    <div className="dashboard">
      <div className="dashboard-animation">
          <Lottie animationData={dashboardAnimation} loop={true} autoPlay={true} />
        </div>
    
      <div className="dashboard-container">
        <h1 className="dashboard-title">Welcome, {user?.name}</h1>

        <div className="dashboard-info">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role || "User"}</p>
        </div>

        <div className="dashboard-buttons">
          <button className="btn-primary" onClick={() => navigate("/sessions")}>
            View Active Sessions
          </button>
          {/* 🔐 🚪*/}

          <button className="btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

