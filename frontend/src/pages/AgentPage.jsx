// === src/pages/AgentPage.jsx ===
import React from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import AgentCommandModal from "../components/AgentCommandModal";

export default function AgentPage() {
  const { token } = useAuth();
  return (
    <div className="flex">

      <main className="flex-1 p-0">
       
        <AgentCommandModal jwt={token} />
      </main>
    </div>
  );
}