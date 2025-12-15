// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/DashBoard";
import Sessions from "./pages/Sessions";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { setNavigator } from "./utils/navigation";
import "./App.css";
import AppLoader from "./components/AppLoader";
import { AuthContext } from "./context/AuthContext";

function NavigatorSetup({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return children;
}

export default function App() {
  const { loading } = useContext(AuthContext);
  if (loading) return <AppLoader />;

  return (
    <>
      <Toaster position="top-center" />

      <BrowserRouter>
        <NavigatorSetup>
          <div className="app-wrapper">
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

              {/* Redirect unknown */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            {/* ✅ Footer INSIDE router layout
            <footer className="cybrex-footer">
              © 2025 Cybrex Security
            </footer> */}
          </div>
        </NavigatorSetup>
      </BrowserRouter>
    </>
  );
}
