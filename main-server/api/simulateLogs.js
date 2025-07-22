const axios = require("axios");

const messages = [
  "User login success",
  "Firewall disabled on host 10.0.0.5",
  "Credit card info leaked",
  "Access to PII by unauthorized user",
  "Health record modified by guest",
  "Admin accessed security camera",
  "Medical data exported",
  "Root access granted to external IP"
];

const users = ["admin", "guest", "john.doe", "root"];
const severities = ["low", "medium", "high", "critical"];
const sources = ["SIEM", "Firewall", "Endpoint", "DLP"];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function loginAndSendLog() {
  try {
    
    const authRes = await axios.post("http://localhost:5000/api/auth/login", {
      username: "collector",
      password: "collector123",
    });
    const token = authRes.data.token;


    const log = {
      message: getRandom(messages),
      user: getRandom(users),
      severity: getRandom(severities),
      accessRole: "user",
      source: getRandom(sources),
    };

   
    const res = await axios.post("http://localhost:5000/api/logs/ingest", log, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ Log Ingested:", res.data);
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
}

loginAndSendLog();
