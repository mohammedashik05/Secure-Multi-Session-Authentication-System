import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";
import { GoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useContext(AuthContext);

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false); // 🔥 NEW

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password || (isRegister && !form.name)) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true); // START LOADING

    try {
      if (isRegister) {
        await api.post("/api/auth/register", form, { withCredentials: true });
        toast.success("Registration successful! Please login.");
        setIsRegister(false);
        setForm({ name: "", email: "", password: "" });
        return;
      }

      const result = await login(form.email, form.password);

      if (!result.success) {
        toast.error(result.message || "Login failed");
        return;
      }

      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false); //  STOP LOADING
    }
  };

  const googleSuccess = async (googleRes) => {
    setLoading(true); 
    const result = await googleLogin(googleRes.credential);

    if (result.success) {
      toast.success("Google Login Successful!");
      navigate("/");
    } else {
      toast.error("Google login failed");
    }
    setLoading(false); // 🔥
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <div className="cybrex-mini-title">Cybrex</div>
        <h2>{isRegister ? "Create Account" : "Login"}</h2>

        <form onSubmit={submit}>
          {isRegister && (
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={change}
              required
              disabled={loading}
            />
          )}

          <input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={change}
            required
            disabled={loading}
          />

          <input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={change}
            required
            disabled={loading}
          />

          {/* 🔥 BUTTON STATE */}
          <button type="submit" disabled={loading}>
            {loading
              ? isRegister
                ? "Registering..."
                : "Logging in..."
              : isRegister
              ? "Register"
              : "Login"}
          </button>
        </form>

        <div className="or-text">or</div>

        {/* 🔥 GOOGLE LOGIN */}
        <div className="google-center">
          <GoogleLogin
            onSuccess={googleSuccess}
            onError={() => toast.error("Google Login Failed")}
            disabled={loading}
          />
        </div>

        <p>
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <span onClick={() => !loading && setIsRegister(!isRegister)}>
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
}
