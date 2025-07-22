import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { fetchLogs } from "../api/api";
import { FaSearch, FaCopy, FaEye, FaDownload, FaFileExport, FaFilePdf } from "react-icons/fa";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("All");
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetchLogs();
      setLogs(res);
      setFilteredLogs(res);
    } catch (err) {
      toast.error("Failed to fetch logs.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    const filtered = logs.filter((log) => {
      const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === "All" || log.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
    setFilteredLogs(filtered);
  }, [searchTerm, severityFilter, logs]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info("Copied!");
  };

  const downloadLogReport = (log) => {
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `log_${log.logID}.json`;
    link.click();
  };

  const exportToCSV = (data, filename = "logs.csv") => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((log) =>
      Object.values(log)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    console.log(`[AUDIT] Exported filtered logs to CSV: ${filename}`);
  };

  const exportToPDF = (data, filename = "logs.pdf") => {
    if (!data.length) return;
    const doc = new jsPDF();
    const columns = Object.keys(data[0]);
    const rows = data.map((log) => columns.map((col) => log[col]));

    doc.text("Filtered Logs Report", 14, 10);
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
    });

    doc.save(filename);
    console.log(`[AUDIT] Exported filtered logs to PDF: ${filename}`);
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-cyan-400">📋 Logs</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#1e293b] border border-gray-600 rounded px-4 py-2 w-full pr-10"
                />
                <FaSearch className="absolute right-3 top-3 text-gray-400" />
              </div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-[#1e293b] border border-gray-600 rounded px-4 py-2 text-sm"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <button
                onClick={() => exportToCSV(filteredLogs, "filtered_logs.csv")}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white text-sm flex items-center gap-2"
              >
                <FaFileExport /> Export CSV
              </button>
              <button
                onClick={() => exportToPDF(filteredLogs, "filtered_logs.pdf")}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white text-sm flex items-center gap-2"
              >
                <FaFilePdf /> Export PDF
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-400">Loading logs...</p>
          ) : filteredLogs.length === 0 ? (
            <p className="text-gray-400">No logs found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-[#1e293b] rounded-lg shadow overflow-hidden">
                <thead>
                  <tr className="text-left bg-[#334155] text-gray-300 text-sm">
                    <th className="p-3">Log ID</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Message</th>
                    <th className="p-3">Risk</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, idx) => (
                    <tr key={idx} className="border-t border-gray-600 hover:bg-[#2c3a4e] transition">
                      <td className="p-3 text-sm flex items-center gap-2">
                        <span className="truncate max-w-[100px]">{log.logID}</span>
                        <FaCopy
                          className="text-gray-400 cursor-pointer hover:text-white"
                          onClick={() => copyToClipboard(log.logID)}
                        />
                      </td>
                      <td className="p-3 text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-white text-xs ${
                            log.severity === "Critical"
                              ? "bg-red-500"
                              : log.severity === "High"
                              ? "bg-orange-400"
                              : log.severity === "Medium"
                              ? "bg-yellow-400 text-black"
                              : "bg-green-500"
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="p-3 text-sm max-w-[300px] truncate">{log.message}</td>
                      <td className="p-3 text-sm">{log.riskScore}</td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="bg-cyan-600 px-2 py-1 rounded hover:bg-cyan-700 text-xs"
                          title="View"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        
          {selectedLog && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-[#1e293b] rounded-lg w-[90%] md:w-[600px] p-6 relative text-sm">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">🧾 Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="absolute top-3 right-4 text-gray-400 hover:text-white text-lg"
                >
                  ×
                </button>
                <div className="space-y-2 text-white">
                  {Object.entries(selectedLog).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium text-gray-300">{key}</span>
                      <span className="text-right break-all max-w-[60%]">{val?.toString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => downloadLogReport(selectedLog)}
                    className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded text-white text-sm flex items-center gap-2"
                  >
                    <FaDownload /> Download Report
                  </button>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(selectedLog, null, 2))}
                    className="text-sm text-cyan-400 hover:text-white"
                  >
                    Copy JSON
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
