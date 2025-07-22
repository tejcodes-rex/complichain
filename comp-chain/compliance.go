package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type LogRecord struct {
	LogID      string `json:"logID"`
	Message    string `json:"message"`
	Timestamp  string `json:"timestamp"`
	User       string `json:"user"`
	AccessRole string `json:"accessRole"`
	Source     string `json:"source"`
	Severity   string `json:"severity"`
	Framework  string `json:"framework"`
	RiskScore  int    `json:"riskScore"`
	Validated  string `json:"validated"`
	Hash       string `json:"hash"`
}

type SmartContract struct {
	contractapi.Contract
}

// ===== Utility Functions =====
func generateHash(data string) string {
	hash := sha256.Sum256([]byte(data))
	return fmt.Sprintf("%x", hash)
}

func determineValidationStatus(framework, severity string, riskScore int) string {
	severity = strings.ToLower(severity)
	if riskScore >= 90 || severity == "critical" {
		return "Rejected"
	} else if riskScore >= 50 || severity == "high" {
		return "NeedsReview"
	}
	return "Verified"
}

// ====== Add Log ======
func (s *SmartContract) AddLog(ctx contractapi.TransactionContextInterface, logID, message, user, accessRole, source, severity, framework, timestamp, riskScoreStr string) error {
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil || clientMSPID != "Org1MSP" {
		return fmt.Errorf("unauthorized client identity")
	}

	existing, _ := ctx.GetStub().GetState(logID)
	if existing != nil {
		return fmt.Errorf("log with ID %s already exists", logID)
	}

	hash := generateHash(logID + message + user + timestamp)
	riskScore := 50
	fmt.Sscanf(riskScoreStr, "%d", &riskScore)
	validated := determineValidationStatus(framework, severity, riskScore)

	log := LogRecord{
		LogID:      logID,
		Message:    message,
		Timestamp:  timestamp,
		User:       user,
		AccessRole: accessRole,
		Source:     source,
		Severity:   severity,
		Framework:  framework,
		RiskScore:  riskScore,
		Validated:  validated,
		Hash:       hash,
	}

	logJSON, err := json.Marshal(log)
	if err != nil {
		return fmt.Errorf("failed to marshal log: %v", err)
	}

	return ctx.GetStub().PutState(logID, logJSON)
}

// ====== Read Log ======
func (s *SmartContract) ReadLog(ctx contractapi.TransactionContextInterface, logID string) (*LogRecord, error) {
	logJSON, err := ctx.GetStub().GetState(logID)
	if err != nil {
		return nil, fmt.Errorf("failed to read log: %v", err)
	}
	if logJSON == nil {
		return nil, fmt.Errorf("log with ID %s not found", logID)
	}

	var log LogRecord
	err = json.Unmarshal(logJSON, &log)
	if err != nil {
		return nil, err
	}
	return &log, nil
}

// ====== Delete Log ======
func (s *SmartContract) DeleteLog(ctx contractapi.TransactionContextInterface, logID string) error {
	existing, err := ctx.GetStub().GetState(logID)
	if err != nil {
		return fmt.Errorf("failed to read log: %v", err)
	}
	if existing == nil {
		return fmt.Errorf("log does not exist")
	}
	return ctx.GetStub().DelState(logID)
}

// ====== Get All Logs ======
func (s *SmartContract) GetAllLogs(ctx contractapi.TransactionContextInterface) ([]*LogRecord, error) {
	iter, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer iter.Close()

	var logs []*LogRecord
	for iter.HasNext() {
		resp, err := iter.Next()
		if err != nil {
			return nil, err
		}
		var log LogRecord
		json.Unmarshal(resp.Value, &log)
		logs = append(logs, &log)
	}
	return logs, nil
}

// ====== Query Logs by User ======
func (s *SmartContract) QueryLogsByUser(ctx contractapi.TransactionContextInterface, user string) ([]*LogRecord, error) {
	allLogs, err := s.GetAllLogs(ctx)
	if err != nil {
		return nil, err
	}

	var filtered []*LogRecord
	for _, log := range allLogs {
		if strings.EqualFold(log.User, user) {
			filtered = append(filtered, log)
		}
	}
	return filtered, nil
}

// ====== Get Log History ======
func (s *SmartContract) GetLogHistory(ctx contractapi.TransactionContextInterface, logID string) ([]string, error) {
	historyIter, err := ctx.GetStub().GetHistoryForKey(logID)
	if err != nil {
		return nil, err
	}
	defer historyIter.Close()

	var history []string
	for historyIter.HasNext() {
		mod, err := historyIter.Next()
		if err != nil {
			return nil, err
		}
		history = append(history, string(mod.Value))
	}
	return history, nil
}

// ====== Mark Log as Reviewed ======
func (s *SmartContract) MarkLogReviewed(ctx contractapi.TransactionContextInterface, logID string) error {
	log, err := s.ReadLog(ctx, logID)
	if err != nil {
		return err
	}

	log.Validated = "Reviewed"
	newJSON, _ := json.Marshal(log)
	return ctx.GetStub().PutState(logID, newJSON)
}

// ====== Verify Integrity ======
func (s *SmartContract) VerifyLogIntegrity(ctx contractapi.TransactionContextInterface, logID, message, user, timestamp string) (bool, error) {
	log, err := s.ReadLog(ctx, logID)
	if err != nil {
		return false, err
	}
	expected := generateHash(logID + message + user + timestamp)
	return log.Hash == expected, nil
}

// ====== Get Statistics ======
func (s *SmartContract) GetLogStats(ctx contractapi.TransactionContextInterface) (map[string]int, error) {
	logs, err := s.GetAllLogs(ctx)
	if err != nil {
		return nil, err
	}

	stats := make(map[string]int)
	for _, log := range logs {
		stats["total"]++
		stats["severity_"+strings.ToLower(log.Severity)]++
		stats["framework_"+strings.ToLower(strings.ReplaceAll(log.Framework, " ", "_"))]++
	}
	return stats, nil
}

// ====== Export Logs ======
func (s *SmartContract) ExportLogs(ctx contractapi.TransactionContextInterface) (string, error) {
	logs, err := s.GetAllLogs(ctx)
	if err != nil {
		return "", err
	}
	data, _ := json.Marshal(logs)
	return string(data), nil
}

// ====== Main ======
func main() {
	chaincode, err := contractapi.NewChaincode(new(SmartContract))
	if err != nil {
		panic(fmt.Sprintf("Error creating chaincode: %v", err))
	}
	if err := chaincode.Start(); err != nil {
		panic(fmt.Sprintf("Error starting chaincode: %v", err))
	}
}
