// === src/pages/AgentsPage.jsx ===

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { FaHeartbeat, FaUserShield, FaClock, FaSyncAlt, FaPlus } from "react-icons/fa";

const dummyAgents = [
  {
    id: "agent-01",
    os: "Linux",
    status: "Active",
    lastCheckIn: "2025-07-03T15:35:00Z",
    version: "v1.2.3",
  },
  {
    id: "agent-02",
    os: "Windows",
    status: "Offline",
    lastCheckIn: "2025-07-02T20:10:00Z",
    version: "v1.2.0",
  },
  {
    id: "agent-03",
    os: "macOS",
    status: "Active",
    lastCheckIn: "2025-07-03T16:10:00Z",
    version: "v1.3.0",
  },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newAgent, setNewAgent] = useState({ id: "", os: "Linux", version: "v1.0.0" });

  const jwt = localStorage.getItem("token");

  useEffect(() => {
    
    setAgents(dummyAgents);
  }, []);

  const refreshAgents = () => {
    setAgents(dummyAgents); 
  };

  const handleCreateAgent = () => {
    const agent = {
      ...newAgent,
      status: "Active",
      lastCheckIn: new Date().toISOString(),
    };
    setAgents((prev) => [...prev, agent]);
    setShowCreate(false);
    setNewAgent({ id: "", os: "Linux", version: "v1.0.0" });
  };

  return (
    <div className="bg-[#0e1628] min-h-screen text-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        
        <div className="sticky top-0 z-50">
          <Navbar />
        </div>

        <main className="p-6 overflow-y-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-cyan-300">Agent Management</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={refreshAgents}
                className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded text-sm flex items-center"
              >
                <FaSyncAlt className="mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm flex items-center"
              >
                <FaPlus className="mr-2" />
                Create Agent
              </button>
            </div>
          </div>

  
          {showCreate && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center">
              <div className="bg-[#1a1f2b] p-6 rounded-lg w-96 shadow-lg space-y-4 border border-cyan-700">
                <h2 className="text-xl font-semibold text-cyan-300">Create New Agent</h2>
                <input
                  className="w-full px-3 py-2 rounded bg-[#2a2f40] text-white"
                  placeholder="Agent ID"
                  value={newAgent.id}
                  onChange={(e) => setNewAgent({ ...newAgent, id: e.target.value })}
                />
                <select
                  className="w-full px-3 py-2 rounded bg-[#2a2f40] text-white"
                  value={newAgent.os}
                  onChange={(e) => setNewAgent({ ...newAgent, os: e.target.value })}
                >
                  <option>Linux</option>
                  <option>Windows</option>
                  <option>macOS</option>
                </select>
                <input
                  className="w-full px-3 py-2 rounded bg-[#2a2f40] text-white"
                  placeholder="Version (e.g., v1.0.0)"
                  value={newAgent.version}
                  onChange={(e) => setNewAgent({ ...newAgent, version: e.target.value })}
                />
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="text-gray-300 hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAgent}
                    className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded"
                  >
                    Add Agent
                  </button>
                </div>
              </div>
            </div>
          )}

      
          <div className="bg-[#1a1f2b] rounded-lg p-6 shadow-md border border-gray-700">
            <h2 className="text-lg font-semibold text-green-400 mb-4">Registered Agents</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="bg-[#2a2f40] text-cyan-200">
                  <tr>
                    <th className="py-3 px-4">Agent ID</th>
                    <th className="py-3 px-4">OS</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Last Check-In</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-700 hover:bg-[#2a2f40] transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-cyan-300">{agent.id}</td>
                      <td className="py-3 px-4">{agent.os}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                            agent.status === "Active"
                              ? "bg-green-500 text-black"
                              : "bg-red-500 text-black"
                          }`}
                        >
                          <FaHeartbeat className="mr-1" />
                          {agent.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{agent.version}</td>
                      <td className="py-3 px-4 flex items-center text-sm text-gray-400">
                        <FaClock className="mr-2 text-yellow-300" />
                        {new Date(agent.lastCheckIn).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {agents.length === 0 && (
                <div className="text-center text-gray-500 py-4">No agents registered yet.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
