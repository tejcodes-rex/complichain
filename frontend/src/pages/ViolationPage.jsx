import React, { useEffect, useState } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function ViolationPage() {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchViolations = async () => {
    try {
      const res = await API.get("/logs");
     
      const violations = res.data.filter((log) => log.validated !== "Verified");
      setLogs(violations);
      setFiltered(violations);
    } catch (err) {
      console.error("❌ Failed to fetch logs", err);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearch(keyword);
    setFiltered(
      logs.filter(
        (log) =>
          log?.user?.toLowerCase().includes(keyword) ||
          log?.framework?.toLowerCase().includes(keyword) ||
          log?.message?.toLowerCase().includes(keyword)
      )
    );
  };

  const getRiskTag = (score) => {
    const risk = parseFloat(score);
    if (risk >= 8) return <span className="text-red-600 font-bold">High</span>;
    if (risk >= 5) return <span className="text-yellow-600 font-semibold">Medium</span>;
    return <span className="text-green-600 font-medium">Low</span>;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
      
        <div className="sticky top-0 z-40 shadow bg-white">
          <Navbar />
        </div>

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">⚠️ Compliance Violations</h2>
            <button
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              onClick={fetchViolations}
            >
              Refresh
            </button>
          </div>

          <input
            type="text"
            placeholder="🔍 Search by user, message, or framework..."
            value={search}
            onChange={handleSearch}
            className="w-full border border-gray-300 p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {filtered.length === 0 ? (
            <p className="text-gray-500 mt-10 text-center">
              ✅ No violations detected currently.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded shadow-sm">
                <thead className="bg-red-100 text-gray-700">
                  <tr>
                    <th className="p-3 text-left">Log ID</th>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Framework</th>
                    <th className="p-3 text-left">Risk</th>
                    <th className="p-3 text-left">Validated</th>
                    <th className="p-3 text-left">Timestamp</th>
                    <th className="p-3 text-left">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => (
                    <tr key={log.logID} className="border-t hover:bg-gray-50">
                      <td className="p-2 text-sm">{log.logID?.slice(0, 8)}...</td>
                      <td className="p-2 text-sm">{log.user}</td>
                      <td className="p-2 text-sm">{log.framework}</td>
                      <td className="p-2 text-sm">{getRiskTag(log.riskScore)}</td>
                      <td className="p-2 text-sm text-red-600 font-bold">{log.validated}</td>
                      <td className="p-2 text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-2 text-sm">
                        <button
                          className="text-blue-600 underline text-sm"
                          onClick={() => setSelectedMessage(log.message)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

      
          {selectedMessage && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-md max-w-lg w-full shadow-lg">
                <h3 className="text-lg font-semibold mb-2">📄 Full Message</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage}</p>
                <button
                  className="mt-4 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => setSelectedMessage(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
