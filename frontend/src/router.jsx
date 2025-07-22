// === src/router.jsx ===
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AgentPage from "./pages/AgentPage";
import LogPage from "./pages/LogPage";
import ViolationPage from "./pages/ViolationPage";
import { useAuth } from "./context/AuthContext";


const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

export default function AppRoutes() {
  return (
    <Routes>
     
      <Route path="/login" element={<LoginPage />} />

 
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agents"
        element={
          <ProtectedRoute>
            <AgentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logs"
        element={
          <ProtectedRoute>
            <LogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/violations"
        element={
          <ProtectedRoute>
            <ViolationPage />
          </ProtectedRoute>
        }
      />

      
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
