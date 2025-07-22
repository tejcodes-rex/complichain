// === src/components/Navbar.jsx ===

import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";

export default function Navbar({ toggleSidebar }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-[#0f172a] text-white px-6 py-4 shadow-md flex justify-between items-center">
      <div className="flex items-center gap-4">
        {/* Hamburger for mobile */}
        <button
          onClick={toggleSidebar}
          className="md:hidden text-white text-2xl focus:outline-none"
        >
          <FaBars />
        </button>
        <div className="flex items-center gap-2 text-xl font-bold text-cyan-400">
          🛡️ CompliChain
          <span className="text-sm bg-cyan-800 px-2 py-0.5 rounded text-white font-mono">
            {user?.role?.toUpperCase() || "GUEST"}
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded transition"
      >
        Logout
      </button>
    </nav>
  );
}
