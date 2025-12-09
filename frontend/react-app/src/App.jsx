// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/DashBoard";
import Sessions from "./pages/Sessions";
import "./App.css"

import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import { setNavigator } from "./utils/navigation";


function NavigatorSetup({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigator(navigate);

  }, [navigate])
  return children;
}





export default function App() {
  return (
    <>
      <Toaster position="top-center" />
      <BrowserRouter>
        <NavigatorSetup>

          

          <Routes>
            {/* Auth */}
            <Route path="/login" element={<Login />} />

            {/* Protected */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sessions"
              element={
                <ProtectedRoute>
                  <Sessions />
                </ProtectedRoute>
              }
            />

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </NavigatorSetup>
      </BrowserRouter>
          <div className="cybrex-footer">© 2025 Cybrex Security</div>
    </>
  );
}
