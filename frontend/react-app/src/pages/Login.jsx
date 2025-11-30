// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/Login.css";

import { GoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;

export default function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);

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
            const endpoint = isRegister ? "register" : "login";

            const res = await axios.post(
                `${API}/api/auth/${endpoint}`,
                form,
                { withCredentials: true }
            );

            // set user in context
            setUser(res.data.user);

            if (isRegister) {
                toast.success("Registration successful! Please login.");
                // Clear fields
                setForm({ name: "", email: "", password: "" });
                // Switch to login mode
                setIsRegister(false);
            } else {
                toast.success("Login successful!");
                navigate("/dashboard");
            }

        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        }
    };

    // ------------------------------
    // GOOGLE LOGIN SUCCESS
    // ------------------------------

    const googleSuccess = async (googleRes) => {
        try {
            const credential = googleRes.credential;

            const res = await axios.post(
                `${API}/api/auth/google`,
                { credential },
                { withCredentials: true }
            );

            setUser(res.data.user);
            toast.success("Google Login Successful!");

            navigate("/dashboard");
        } catch (err) {
            console.log(err);
            toast.error("Google login failed");
        }
    };

    return (
        <div className="login-body">
            <div className="login-container">

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

                <div style={{ margin: "10px 0",  textAlign:"center", color:"white"}}>or</div>

                {/* GOOGLE LOGIN BUTTON */}
                <GoogleLogin
                    onSuccess={googleSuccess}
                    onError={() => {
                        toast.error("Google Login Failed");
                    }}
                />

                <p style={{ marginTop: "10px" }}>
                    {isRegister
                        ? "Already have an account?"
                        : "Don't have an account?"}

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
