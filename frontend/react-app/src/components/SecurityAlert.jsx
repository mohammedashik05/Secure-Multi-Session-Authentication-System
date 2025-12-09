import React from "react";
import "../style/SecurityAlert.css"


export default function SecurityAlert({ security, onClose }) {
    if (!security?.status) return null;

    return (
        <div className="alert-overlay">
            <div className="alert-box">
                <h2>⚠ Suspicious Login Detected</h2>
                <p>{security.reason}</p>

                <button onClick={onClose}>OK</button>
            </div>
        </div>
    )
}