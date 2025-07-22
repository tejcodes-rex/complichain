# 🔐 Tamper-Proof Compliance Framework Using Hyperledger Fabric

A working prototype for a blockchain-based log management system that ensures **tamper resistance**, **auditability**, and **compliance assurance** in critical infrastructure. This project leverages **Hyperledger Fabric** to store classified logs in an immutable ledger, enabling trust and traceability for compliance and security teams.

> ⚠️ **Note**: This is a functional prototype intended to demonstrate the concept. It is not production-ready and still under active development. Security hardening and feature completeness are pending.

---

## 📸 Project Screenshots

| Dashboard | Agent Management | Log Viewer | Violation Insights |
|----------|------------------|-------------|-------------------|
| ![Dashboard](https://github.com/user-attachments/assets/d5b1e7c1-57e1-49f6-8894-58c690cc3ec6) | ![Agents](https://github.com/user-attachments/assets/d0b7bccf-bc1a-4a96-90e2-d7fe0f51e189) | ![Logs](https://github.com/user-attachments/assets/7c0012e8-a307-4164-af99-4559a33791ad) | ![Violations](https://github.com/user-attachments/assets/451da70d-1785-4a5b-bf9e-fc45337b2ec9) | 

---

## ⚙️ Key Features

- 🔐 Immutable log storage using **Hyperledger Fabric**
- 📩 log ingestion with classification & basic risk scoring
- 🛡️ Tamper-proof audit trail using cryptographic hashing
- 🧑‍💼 Role-based JWT authentication (`admin`, `collector`)
- 📊 Visual dashboard showing severity breakdown, compliance framework stats, and recent violations
- 🕵️ Query logs by ID, user, source, severity, and framework
- 🧮 off-chain validation of logs (severity & risk-based)
- 📥 Export and verify logs via smart contract methods

---

## 🚧 Known Limitations

- ❌ No ML-based log classification — simple rule-based validation is used
- 🔓 Several security improvements pending (rate-limiting, HTTPS, auth hardening)
- 📉 Frontend lacks agent health or real-time monitoring
- 📦 Logs are stored in-memory on Fabric only; no off-chain backup or forward
- 🧪 No unit tests or CI/CD yet

This is **intended to be an early-stage prototype** for research, demo, and evaluation purposes.

---

## 🏁 Getting Started

### 🧰 Prerequisites

- Node.js v18+
- Go (v1.20+)
- Docker & Docker Compose
- Git
- VSCode (recommended)

---

## 🛠️ Project Setup

### 1. 📥 Clone the Repository

```bash
git clone https://github.com/tejcodes-rex/complichain
cd complichain
```
### 2. 📦 Setup Hyperledger Fabric Samples
```bash
curl -sSL https://bit.ly/2ysbOFE | bash -s
cd fabric-samples/test-network
```
### 3. 🧪 Start Fabric Network
```bash
./network.sh up createChannel -ca
./network.sh deployCC -ccn compliance -ccp ../comp-chain/compliance/ -ccl go
```
>✅ Ensure your chaincode is placed in:
fabric-samples/chaincode/compliance/

## 🚀 Running the Backend API

### 1. 📦 Install dependencies
```bash
cd backend
npm install
```
### 3. 🔐 Setup Environment Variables
Create a .env file:
```bash
JWT_SECRET=supersecretkey
```
### 3. ▶️ Start the API
```bash
node server.js
```
> ✅ Server will run at: http://localhost:5000

## 🌐 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
>Default port: http://localhost:5175

## 📄 Sample Logs for Testing

###  Sample 1: Benign Access

```bash
curl -X POST http://localhost:5000/api/logs/ingest \
-H "Authorization: Bearer <JWT_TOKEN>" \
-H "Content-Type: application/json" \
-d '{
  "message": "User login from VPN endpoint",
  "user": "alice",
  "severity": "Low",
  "accessRole": "employee",
  "source": "agent-linux-1"
}'
```

###  Sample 2: Violation Attempt

```bash
curl -X POST http://localhost:5000/api/logs/ingest \
-H "Authorization: Bearer <JWT_TOKEN>" \
-H "Content-Type: application/json" \
-d '{
  "message": "User login from VPN endpoint",
  "user": "alice",
  "severity": "Low",
  "accessRole": "employee",
  "source": "agent-linux-1"
}'
```


