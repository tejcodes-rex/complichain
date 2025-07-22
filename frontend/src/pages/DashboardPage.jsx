 import React, { useEffect, useState } from "react";
import {
  FaMicrochip,
  FaCheckCircle,
  FaTimesCircle,
  FaSatelliteDish,
  FaServer,
  FaClock,
  FaDownload,
  FaLink,
  FaEye,
  FaBars,
  FaHome,
  FaChartArea,
  FaUserSecret,
  FaExclamationTriangle,
  FaCogs,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import {
  getStats,
  getTrends,
  getViolationBreakdown,
  getRecentViolations,
} from "../api/api";


const sampleStats = {
  totalLogs: 200,
  validatedLogs: 150,
  violations: 25,
  agents: 5,
  activeNodes: 3,
  uptime: "99.9%",
  severityDistribution: [
    { severity: "Low", count: 40 },
    { severity: "Medium", count: 60 },
    { severity: "High", count: 30 },
    { severity: "Critical", count: 20 },
    { severity: "Unknown", count: 50 },
  ],
  frameworkCoverage: [
    { framework: "PCI DSS", count: 50 },
    { framework: "HIPAA", count: 40 },
    { framework: "SOC2", count: 30 },
    { framework: "GDPR", count: 25 },
    { framework: "Other", count: 55 },
  ],
};

const sampleTrends = [
  { time: "00:00", count: 10 },
  { time: "03:00", count: 25 },
  { time: "06:00", count: 40 },
  { time: "09:00", count: 65 },
  { time: "12:00", count: 80 },
  { time: "15:00", count: 60 },
  { time: "18:00", count: 50 },
];

const sampleViolations = [
  {
    severity: "Critical",
    message: "Unauthorized root access attempt",
    timestamp: new Date().toISOString(),
    txID: "abc123",
    block: "12",
  },
  {
    severity: "High",
    message: "Firewall rule tampered",
    timestamp: new Date().toISOString(),
    txID: "xyz456",
    block: "13",
  },
];

const getRoleFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return "Guest";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || "User";
  } catch {
    return "User";
  }
};

const StatCard = ({ icon, label, value, onView }) => (
  <div className="bg-[#1a1f2b] p-4 rounded-lg flex justify-between items-center shadow hover:shadow-cyan-400/20 transition-all">
    <div className="flex items-center">
      <div className="p-3 bg-[#2f3548] rounded-full mr-4 text-cyan-300 text-xl">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
    {onView && (
      <button onClick={onView} className="text-cyan-300 hover:underline text-sm flex items-center">
        <FaEye className="mr-1" /> View
      </button>
    )}
  </div>
);

const DashboardPage = () => {
  const [navOpen, setNavOpen] = useState(true);
  const [useSample, setUseSample] = useState(false);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [violations, setViolations] = useState([]);
  const [frameworkData, setFrameworkData] = useState([]);
  const role = getRoleFromToken();
  const navigate = useNavigate();

  const fetchData = async () => {
    if (useSample) {
      setStats(sampleStats);
      setTrends(sampleTrends);
      setViolations(sampleViolations);
      setFrameworkData(sampleStats.frameworkCoverage.map(f => ({ name: f.framework, value: f.count })));
    } else {
      try {
        const [s, t, f, v] = await Promise.all([
          getStats(),
          getTrends(),
          getViolationBreakdown(),
          getRecentViolations(),
        ]);
        setStats(s);
        setTrends(t);
        setFrameworkData(f);
        setViolations(v);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 30000);
    return () => clearInterval(iv);
  }, [useSample]);

  if (!stats) return <div className="text-white p-10">Loading...</div>;

  const exportDashboard = async () => {
    const canvas = await html2canvas(document.getElementById("dashboard"));
    canvas.toBlob(b => saveAs(b, "dashboard.png"));
  };

  const compliancePct = ((stats.validatedLogs / stats.totalLogs) * 100).toFixed(1);

  const barData = {
    labels: stats.severityDistribution.map(s => s.severity),
    datasets: [{ data: stats.severityDistribution.map(s => s.count), backgroundColor: "#38bdf8", barThickness: 22 }],
  };

  const doughData = {
    labels: frameworkData.map(f => f.name),
    datasets: [{ data: frameworkData.map(f => f.value), backgroundColor: ["#3f51b5","#9c27b0","#ff9800","#4caf50","#e91e63"] }],
  };

  const lineData = {
    labels: trends.map(t => t.time),
    datasets: [{
      data: trends.map(t => t.count),
      borderColor: "#38bdf8",
      fill: true,
      tension: 0.4,
      backgroundColor: ctx => {
        const grad = ctx.chart.ctx.createLinearGradient(0,0,0,300);
        grad.addColorStop(0, "rgba(56,189,248,0.3)");
        grad.addColorStop(1, "rgba(56,189,248,0)");
        return grad;
      }
    }],
  };

  return (
    <div className="flex bg-[#0e1628] min-h-screen text-white">
      
      <div className={`bg-[#0c111a] transition-width duration-300 ${navOpen ? "w-64" : "w-16"}`}>
        <button onClick={() => setNavOpen(!navOpen)} className="p-4 focus:outline-none">
          <FaBars />
        </button>
        <nav className="mt-4">
          {[
            { icon: <FaHome />, label: "Dashboard", to: "/" },
            { icon: <FaChartArea />, label: "Logs", to: "/logs" },
            { icon: <FaUserSecret />, label: "Agents", to: "/agents" },        
            { icon: <FaExclamationTriangle />, label: "Violations", to: "/violations" }, 
            { icon: <FaCogs />, label: "Settings", to: "/settings" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center p-4 hover:bg-[#1a1f2b] cursor-pointer"
              onClick={() => navigate(item.to)}
            >
              {item.icon}
              {navOpen && <span className="ml-3">{item.label}</span>}
            </div>
          ))}
        </nav>
      </div>

    
      <div className="flex-1 p-6" id="dashboard">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-extrabold text-cyan-300"> Dashboard</h1>
          <div className="flex items-center gap-4">
            <label className="flex items-center text-sm text-gray-300">
              <input type="checkbox" className="form-checkbox text-cyan-500 mr-1" checked={useSample} onChange={e => setUseSample(e.target.checked)} />
            
            </label>
            <span className="text-sm text-gray-300">👤 Role: <span className="text-cyan-400">{role}</span></span>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <StatCard icon={<FaMicrochip />} label="Total Logs" value={stats.totalLogs} onView={() => navigate("/logs")} />
          <StatCard icon={<FaCheckCircle />} label="Validated Logs" value={stats.validatedLogs} />
          <StatCard icon={<FaTimesCircle />} label="Violations" value={stats.violations} onView={() => navigate("/violations")} />
          <StatCard icon={<FaSatelliteDish />} label="Agents" value={stats.agents} />
          <StatCard icon={<FaServer />} label="Active Nodes" value={stats.activeNodes} />
          <StatCard icon={<FaClock />} label="Uptime" value={stats.uptime} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1a1f2b] p-6 rounded-xl text-center shadow-lg">
            <h2 className="text-green-400 font-semibold">🛡️ Compliance Summary</h2>
            <div className="relative w-32 h-32 mx-auto my-4">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="gray" strokeWidth="1"/>
                <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                  fill="none" stroke="#4ade80" strokeWidth="2" strokeDasharray={`${compliancePct},100`}/>
                <text x="18" y="20.35" fill="white" fontSize="4" textAnchor="middle">{compliancePct}%</text>
              </svg>
            </div>
          </div>
          <div className="bg-[#0c111a] p-6 rounded-xl font-mono text-green-300 text-sm shadow-inner border border-gray-700">
            <h2 className="text-cyan-400 font-semibold">🔗 Fabric Network Info</h2>
            <div className="bg-[#0e1628] p-3 rounded border border-gray-600">
              Channel: compliance-channel<br />
              Chaincode: logchaincode<br />
              Version: v1.0<br />
              Status: Online
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1a1f2b] p-4 rounded-xl">
            <h2 className="text-blue-300 font-semibold"> Severity Distribution</h2>
            <Bar data={barData} options={{ plugins: { legend: { display: false } } }} />
          </div>
          <div className="bg-[#1a1f2b] p-4 rounded-xl flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 mx-auto">
              <h2 className="text-purple-300 font-semibold"> Framework Coverage</h2>
              <Doughnut data={doughData} options={{ cutout: "65%", plugins: { legend: { display: false } } }} />
            </div>
            <ul className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-6 text-sm space-y-2">
              {frameworkData.map((f,i)=><li key={i} className="flex items-center"><span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: doughData.datasets[0].backgroundColor[i]}}></span>{f.name}</li>)}
            </ul>
          </div>
          <div className="bg-[#1a1f2b] p-4 rounded-xl">
            <h2 className="text-cyan-300 font-semibold"> Log Volume Over Time</h2>
            <Line data={lineData} options={{ plugins: { legend: { display: false } } }} />
          </div>
          <div className="bg-[#1a1f2b] p-4 rounded-xl">
            <h2 className="text-red-300 font-semibold">🚨 Recent Violations</h2>
            <ul className="space-y-3 mt-3">
              {violations.map((v,i)=>(
                <li key={i} className="flex justify-between items-center bg-[#2a2f40] p-3 rounded">
                  <span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${v.severity==="Critical"?"bg-red-400":v.severity==="High"?"bg-orange-300":"bg-yellow-300"}`}>{v.severity}</span>
                  <span className="flex-1 px-2">{v.message}</span>
                  <span className="text-xs text-gray-400">{new Date(v.timestamp).toLocaleString()}</span>
                  <button onClick={()=>navigate(`/logs?txID=${v.txID}`)} className="text-cyan-300 text-xs hover:underline flex items-center"><FaLink className="mr-1"/>View</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button onClick={exportDashboard} className="bg-cyan-500 hover:bg-cyan-700 px-4 py-2 rounded flex items-center">
          <FaDownload className="mr-2"/> Export Dashboard
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;