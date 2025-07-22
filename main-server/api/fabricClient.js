// === fabricClient.js ===

const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");


const walletPath = path.join(__dirname, "../wallet/org1");
const ccpPath = path.resolve(__dirname, "../connection.json");
const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));


async function submitLogToChaincode(log) {
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: "admin",
    discovery: { enabled: true, asLocalhost: true },
  });

  const network = await gateway.getNetwork("mychannel");
  const contract = network.getContract("compliance");

  await contract.submitTransaction(
    "AddLog",
    log.logID,
    log.message,
    log.user,
    log.accessRole,
    log.source,
    log.severity,
    log.framework,
    log.timestamp,
    String(log.riskScore)
  );

  await gateway.disconnect();
}


async function getAllLogs() {
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: "admin",
    discovery: { enabled: true, asLocalhost: true },
  });

  const network = await gateway.getNetwork("mychannel");
  const contract = network.getContract("compliance");

  const result = await contract.evaluateTransaction("GetAllLogs");
  await gateway.disconnect();

  return JSON.parse(result.toString());
}


async function deleteLog(logID) {
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: "admin",
    discovery: { enabled: true, asLocalhost: true },
  });

  const network = await gateway.getNetwork("mychannel");
  const contract = network.getContract("compliance");

  await contract.submitTransaction("DeleteLog", logID);
  await gateway.disconnect();
}


async function getStats() {
  const logs = await getAllLogs();

  const totalLogs = logs.length;
  let validatedLogs = 0;
  let violations = 0;
  const severityMap = {};
  const frameworkMap = {};
  const agentsSet = new Set();
  const activeNodesSet = new Set();

  logs.forEach((log) => {
 
    if (log.validated === true || log.validated === "true") validatedLogs++;

    
    if (log.riskScore && parseFloat(log.riskScore) > 7.0) violations++;

   
    const severity = log.severity || "Unknown";
    severityMap[severity] = (severityMap[severity] || 0) + 1;

   
    const framework = log.framework || "Other";
    frameworkMap[framework] = (frameworkMap[framework] || 0) + 1;

   
    if (log.source) agentsSet.add(log.source);
    if (log.timestamp) activeNodesSet.add(log.source);
  });

  
  const severityDistribution = Object.entries(severityMap).map(([severity, count]) => ({ severity, count }));
  const frameworkCoverage = Object.entries(frameworkMap).map(([framework, count]) => ({ framework, count }));

  return {
    totalLogs,
    validatedLogs,
    violations,
    severityDistribution,
    frameworkCoverage,
    agents: agentsSet.size,
    activeNodes: activeNodesSet.size,
    uptime: "99.99%" // Placeholder
  };
}

module.exports = {
  submitLogToChaincode,
  getAllLogs,
  deleteLog,
  getStats
};
