// === src/components/Sidebar.jsx ===
import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserShield,
  FaFileAlt,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const links = [
    { path: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/agents", label: "Agents", icon: <FaUserShield /> },
    { path: "/logs", label: "Logs", icon: <FaFileAlt /> },
    { path: "/violations", label: "Violations", icon: <FaExclamationTriangle /> },
  ];

  return (
    <aside
      className={`fixed z-50 top-0 left-0 h-70 w-64 bg-[#1e293b] text-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 md:relative md:translate-x-0 md:flex-shrink-0`}
    >
      <div className="flex justify-between items-center p-5 md:hidden">
        <div className="text-xl font-bold text-cyan-400"> Navigation</div>
        <button onClick={toggleSidebar} className="text-white text-xl">
          <FaTimes />
        </button>
      </div>

      <div className="hidden md:block p-5 text-2xl font-bold text-cyan-300"> Navigation</div>

      <ul className="space-y-3 p-5">
        {links.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded transition-all ${
                  isActive ? "bg-cyan-600" : "hover:bg-cyan-800"
                }`
              }
              onClick={toggleSidebar}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
