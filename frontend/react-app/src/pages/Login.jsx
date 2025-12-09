// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";

import { GoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import api from "../api/axios"; // ✅ use configured axios instance

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useContext(AuthContext);

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ------------------------------
  // NORMAL REGISTER / LOGIN
  // ------------------------------

  const submit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password || (isRegister && !form.name)) {
      toast.error("All fields are required");
      return;
    }

    try {
      if (isRegister) {
        // ✅ use api instance (baseURL + credentials)
        await api.post("/api/auth/register", form, { withCredentials: true });

        toast.success("Registration successful! Please login.");
        setIsRegister(false);
        setForm({ name: "", email: "", password: "" });
        return;
      }

      // ✅ use context login (handles token + user)
      const result = await login(form.email, form.password);

      if (!result.success) {
        toast.error(result.message || "Login failed");
        return; // ❗ stop here on failure
      }

      toast.success("Login successful!");
      navigate("/"); // ✅ dashboard route is "/"
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  // ------------------------------
  // GOOGLE LOGIN SUCCESS
  // ------------------------------

  const googleSuccess = async (googleRes) => {
    const credential = googleRes.credential;

    const result = await googleLogin(credential);

    if (result.success) {
      toast.success("Google Login Successful!");
      navigate("/"); // ✅ same as normal login
    } else {
      toast.error("Google login failed");
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
          <div className="cybrex-mini-title">Cybrex </div>
        <h2>{isRegister ? "Create Account" : "Login"}</h2>

        <form onSubmit={submit}>
          {isRegister && (
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={change}
              required
            />
          )}

          <input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={change}
            required
          />

          <input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={change}
            required
          />

          <button type="submit">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <div
          style={{
            margin: "10px 0",
            textAlign: "center",
            color: "white",
          }}
        >
          or
        </div>

        {/* GOOGLE LOGIN BUTTON */}
        <GoogleLogin
          onSuccess={googleSuccess}
          onError={() => {
            toast.error("Google Login Failed");
          }}
        />

        <p style={{ marginTop: "10px" }}>
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <span
            style={{ color: "blue", cursor: "pointer", marginLeft: "5px" }}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
}
