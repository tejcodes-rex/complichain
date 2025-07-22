// === classify.js ===

const classifyLog = (log) => {
  const message = log.message.toLowerCase();
  let framework = "Unknown";
  let riskScore = 50;
  let validated = "NeedsReview";

  
  const rules = [
    {
      match: ["credit card", "card data", "cvv", "expiration date"],
      framework: "PCI DSS",
      risk: 90,
      status: "Rejected",
    },
    {
      match: ["pii", "personal data", "name", "dob", "ssn", "aadhaar"],
      framework: "GDPR",
      risk: 85,
      status: "NeedsReview",
    },
    {
      match: ["health", "phi", "medical record", "patient"],
      framework: "HIPAA",
      risk: 95,
      status: "Rejected",
    },
    {
      match: ["firewall", "disabled", "turned off"],
      framework: "NIST-CSF",
      risk: 75,
      status: "NeedsReview",
    },
    {
      match: ["login", "unauthorized", "failed"],
      framework: "ISO27001",
      risk: 70,
      status: "NeedsReview",
    },
    {
      match: ["login", "success"],
      framework: "ISO27001",
      risk: 10,
      status: "Verified",
    },
    {
      match: ["data breach", "data leak"],
      framework: "GDPR",
      risk: 98,
      status: "Rejected",
    },
    {
      match: ["unpatched", "vulnerability", "exploit"],
      framework: "NIST-CSF",
      risk: 85,
      status: "NeedsReview",
    },
    {
      match: ["unauthorized access", "privilege escalation"],
      framework: "ISO27001",
      risk: 90,
      status: "Rejected",
    },
    {
      match: ["suspicious activity", "anomaly detected"],
      framework: "SOC2",
      risk: 65,
      status: "NeedsReview",
    },
    {
      match: ["configuration change", "misconfiguration"],
      framework: "ISO27001",
      risk: 60,
      status: "NeedsReview",
    },
    {
      match: ["network scan", "port scan"],
      framework: "NIST-CSF",
      risk: 55,
      status: "NeedsReview",
    },
    {
      match: ["malware", "ransomware", "trojan"],
      framework: "HIPAA",
      risk: 90,
      status: "Rejected",
    },
    {
      match: ["no encryption", "unencrypted", "plaintext password"],
      framework: "PCI DSS",
      risk: 95,
      status: "Rejected",
    },
    {
      match: ["audit log deleted", "log tampering"],
      framework: "SOX",
      risk: 99,
      status: "Rejected",
    },
  ];


  for (const rule of rules) {
    if (rule.match.some((keyword) => message.includes(keyword))) {
      framework = rule.framework;
      riskScore = rule.risk;
      validated = rule.status;
      break;
    }
  }

  return { framework, riskScore, validated };
};

module.exports = classifyLog;
