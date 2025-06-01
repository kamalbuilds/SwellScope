// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @title IRiskOracle
 * @dev Interface for risk assessment oracle providing real-time risk metrics
 */
interface IRiskOracle {
    
    struct RiskMetrics {
        uint256 slashingRisk;
        uint256 liquidityRisk;
        uint256 smartContractRisk;
        uint256 marketRisk;
        uint256 compositeRisk;
        uint256 lastUpdate;
    }
    
    struct ValidatorMetrics {
        uint256 performanceScore;
        uint256 slashingHistory;
        uint256 uptime;
        uint256 commission;
        bool isActive;
    }
    
    struct ProtocolMetrics {
        uint256 tvl;
        uint256 utilization;
        uint256 liquidityRatio;
        uint256 securityScore;
        uint256 auditScore;
    }

    // Events
    event RiskScoreUpdated(address indexed asset, uint256 oldScore, uint256 newScore);
    event ValidatorScoreUpdated(address indexed validator, uint256 score);
    event ProtocolScoreUpdated(address indexed protocol, uint256 score);
    event EmergencyAlert(address indexed asset, uint256 riskScore, string reason);

    // Risk assessment functions
    function getRiskScore(address asset) external view returns (uint256);
    function getRiskMetrics(address asset) external view returns (RiskMetrics memory);
    function getValidatorMetrics(address validator) external view returns (ValidatorMetrics memory);
    function getProtocolMetrics(address protocol) external view returns (ProtocolMetrics memory);
    
    // Risk scoring functions
    function calculateCompositeRisk(address asset) external view returns (uint256);
    function calculateSlashingRisk(address validator) external view returns (uint256);
    function calculateLiquidityRisk(address asset) external view returns (uint256);
    function calculateSmartContractRisk(address protocol) external view returns (uint256);
    
    // Update functions (only for authorized oracles)
    function updateRiskScore(address asset, uint256 newScore) external;
    function updateValidatorMetrics(address validator, ValidatorMetrics calldata metrics) external;
    function updateProtocolMetrics(address protocol, ProtocolMetrics calldata metrics) external;
    
    // Emergency functions
    function triggerEmergencyAlert(address asset, string calldata reason) external;
    function isEmergencyActive(address asset) external view returns (bool);
    
    // Configuration functions
    function setRiskThreshold(address asset, uint256 threshold) external;
    function getRiskThreshold(address asset) external view returns (uint256);
} 