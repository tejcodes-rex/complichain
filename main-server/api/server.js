require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const classifyLog = require("./classify");
const {
  submitLogToChaincode,
  getAllLogs,
  deleteLog,
  getStats,
} = require("./fabricClient");

const { Gateway, Wallets } = require("fabric-network");
const fs = require("fs");
const path = require("path");

const app = express();


app.use(cors({
  origin: "http://localhost:5175",
  credentials: true
}));

app.use(bodyParser.json());


const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "collector", password: "collector123", role: "collector" },
];


function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}


function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.sendStatus(403);
    next();
  };
}


app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});


app.post("/api/logs/ingest", authenticateToken, authorizeRoles("collector", "admin"), async (req, res) => {
  try {
    const { message, user, severity, accessRole, source } = req.body;
    if (!message || !user || !severity || !source) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { framework, riskScore, validated } = classifyLog({ message });
    const logID = uuidv4();
    const timestamp = new Date().toISOString();
    const hash = crypto.createHash("sha256").update(logID + message + user + timestamp).digest("hex");

    const finalLog = {
      logID,
      message,
      timestamp,
      user,
      accessRole: accessRole || "user",
      source,
      severity,
      framework,
      riskScore,
      validated,
      hash,
    };

    await submitLogToChaincode(finalLog);
    return res.status(200).json({ success: true, logID, framework, riskScore, validated });
  } catch (err) {
    console.error("Ingest Error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/logs/stats", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const stats = await getStats();
    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ error: "Failed to get stats" });
  }
});


app.get("/api/logs/trends", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const logs = await getAllLogs();
    const grouped = {};

    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const hour = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`;
      grouped[hour] = (grouped[hour] || 0) + 1;
    });

    const trendData = Object.keys(grouped).map(time => ({
      time,
      count: grouped[time],
    }));

    res.json(trendData);
  } catch (err) {
    return res.status(500).json({ error: "Failed to get trends" });
  }
});


app.get("/api/logs/violations/breakdown", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const logs = await getAllLogs();
    const breakdown = {};

    logs.forEach(log => {
      const framework = log.framework || "Unknown";
      breakdown[framework] = (breakdown[framework] || 0) + 1;
    });

    const data = Object.entries(breakdown).map(([name, value]) => ({ name, value }));
    res.json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to get breakdown" });
  }
});


app.get("/api/logs/violations/recent", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const logs = await getAllLogs();

    const violations = logs
      .filter(log => !log.validated)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json(violations);
  } catch (err) {
    return res.status(500).json({ error: "Failed to get recent violations" });
  }
});


app.get("/api/logs", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const logs = await getAllLogs();
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch logs" });
  }
});


app.get("/api/logs/:id", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  const logID = req.params.id;
  try {
    const ccpPath = path.resolve(__dirname, "../connection.json");
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    const walletPath = path.join(__dirname, "../wallet/org1");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "admin",
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("compliance");

    const result = await contract.evaluateTransaction("ReadLog", logID);
    await gateway.disconnect();

    const logData = JSON.parse(result.toString());
    return res.status(200).json({ success: true, data: logData });
  } catch (err) {
    console.error("Read Error:", err.message);
    return res.status(500).json({ error: `Failed to read log: ${err.message}` });
  }
});


app.delete("/api/logs/:id", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    await deleteLog(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete log" });
  }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
