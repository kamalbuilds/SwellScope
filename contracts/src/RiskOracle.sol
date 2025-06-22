// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IRiskOracle.sol";

/**
 * @title RiskOracle
 * @dev Production-ready risk assessment oracle for Swellchain restaking protocols
 * @dev Provides real-time risk metrics for assets, validators, and protocols
 */
contract RiskOracle is IRiskOracle, AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant RISK_MANAGER_ROLE = keccak256("RISK_MANAGER_ROLE");

    // Risk data storage
    mapping(address => RiskMetrics) private assetRiskMetrics;
    mapping(address => ValidatorMetrics) private validatorMetrics;
    mapping(address => ProtocolMetrics) private protocolMetrics;
    mapping(address => uint256) private riskThresholds;
    mapping(address => bool) private emergencyStatus;

    // Configuration
    uint256 public constant MAX_RISK_SCORE = 10000; // 100.00% in basis points
    uint256 public constant EMERGENCY_THRESHOLD = 9000; // 90.00% 
    uint256 public constant STALENESS_THRESHOLD = 1 hours;

    // Risk scoring weights (in basis points)
    uint256 public slashingWeight = 3000; // 30%
    uint256 public liquidityWeight = 2500; // 25%
    uint256 public smartContractWeight = 2500; // 25%
    uint256 public marketWeight = 2000; // 20%

    modifier onlyOracle() {
        require(hasRole(ORACLE_ROLE, msg.sender), "RiskOracle: caller is not an oracle");
        _;
    }

    modifier onlyRiskManager() {
        require(hasRole(RISK_MANAGER_ROLE, msg.sender), "RiskOracle: caller is not a risk manager");
        _;
    }

    modifier onlyEmergency() {
        require(hasRole(EMERGENCY_ROLE, msg.sender), "RiskOracle: caller is not emergency responder");
        _;
    }

    constructor(address admin, address oracle) {
        require(admin != address(0), "RiskOracle: admin cannot be zero address");
        require(oracle != address(0), "RiskOracle: oracle cannot be zero address");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ORACLE_ROLE, oracle);
        _grantRole(EMERGENCY_ROLE, admin);
        _grantRole(RISK_MANAGER_ROLE, admin);
    }

    /**
     * @dev Get the current risk score for an asset
     */
    function getRiskScore(address asset) external view override returns (uint256) {
        return assetRiskMetrics[asset].compositeRisk;
    }

    /**
     * @dev Get comprehensive risk metrics for an asset
     */
    function getRiskMetrics(address asset) external view override returns (RiskMetrics memory) {
        return assetRiskMetrics[asset];
    }

    /**
     * @dev Get validator performance metrics
     */
    function getValidatorMetrics(address validator) external view override returns (ValidatorMetrics memory) {
        return validatorMetrics[validator];
    }

    /**
     * @dev Get protocol risk metrics
     */
    function getProtocolMetrics(address protocol) external view override returns (ProtocolMetrics memory) {
        return protocolMetrics[protocol];
    }

    /**
     * @dev Calculate composite risk score for an asset
     */
    function calculateCompositeRisk(address asset) external view override returns (uint256) {
        RiskMetrics memory metrics = assetRiskMetrics[asset];
        
        // Weighted average of risk components
        uint256 compositeRisk = (
            metrics.slashingRisk * slashingWeight +
            metrics.liquidityRisk * liquidityWeight +
            metrics.smartContractRisk * smartContractWeight +
            metrics.marketRisk * marketWeight
        ) / 10000;

        return compositeRisk > MAX_RISK_SCORE ? MAX_RISK_SCORE : compositeRisk;
    }

    /**
     * @dev Calculate slashing risk for a validator
     */
    function calculateSlashingRisk(address validator) external view override returns (uint256) {
        ValidatorMetrics memory metrics = validatorMetrics[validator];
        
        if (!metrics.isActive) {
            return MAX_RISK_SCORE;
        }

        // Risk increases with slashing history and decreases with performance
        uint256 baseRisk = metrics.slashingHistory * 1000; // Each slash = 10% risk
        uint256 performanceAdjustment = (10000 - metrics.performanceScore) / 2;
        uint256 uptimeAdjustment = (10000 - metrics.uptime) / 4;

        uint256 totalRisk = baseRisk + performanceAdjustment + uptimeAdjustment;
        return totalRisk > MAX_RISK_SCORE ? MAX_RISK_SCORE : totalRisk;
    }

    /**
     * @dev Calculate liquidity risk for an asset
     */
    function calculateLiquidityRisk(address asset) external view override returns (uint256) {
        ProtocolMetrics memory metrics = protocolMetrics[asset];
        
        if (metrics.tvl == 0) {
            return MAX_RISK_SCORE;
        }

        // Higher utilization = higher liquidity risk
        uint256 utilizationRisk = metrics.utilization;
        
        // Lower liquidity ratio = higher risk
        uint256 liquidityRisk = metrics.liquidityRatio > 0 ? 
            (10000 * 1000) / metrics.liquidityRatio : MAX_RISK_SCORE;

        uint256 totalRisk = (utilizationRisk + liquidityRisk) / 2;
        return totalRisk > MAX_RISK_SCORE ? MAX_RISK_SCORE : totalRisk;
    }

    /**
     * @dev Calculate smart contract risk for a protocol
     */
    function calculateSmartContractRisk(address protocol) external view override returns (uint256) {
        ProtocolMetrics memory metrics = protocolMetrics[protocol];
        
        // Risk decreases with higher security and audit scores
        uint256 securityRisk = 10000 - metrics.securityScore;
        uint256 auditRisk = 10000 - metrics.auditScore;
        
        uint256 totalRisk = (securityRisk + auditRisk) / 2;
        return totalRisk > MAX_RISK_SCORE ? MAX_RISK_SCORE : totalRisk;
    }

    /**
     * @dev Update risk score for an asset (oracle only)
     */
    function updateRiskScore(address asset, uint256 newScore) external override onlyOracle whenNotPaused {
        require(asset != address(0), "RiskOracle: asset cannot be zero address");
        require(newScore <= MAX_RISK_SCORE, "RiskOracle: risk score exceeds maximum");

        uint256 oldScore = assetRiskMetrics[asset].compositeRisk;
        assetRiskMetrics[asset].compositeRisk = newScore;
        assetRiskMetrics[asset].lastUpdate = block.timestamp;

        emit RiskScoreUpdated(asset, oldScore, newScore);

        // Check for emergency threshold
        if (newScore >= EMERGENCY_THRESHOLD && !emergencyStatus[asset]) {
            emergencyStatus[asset] = true;
            emit EmergencyAlert(asset, newScore, "Risk score exceeded emergency threshold");
        }
    }

    /**
     * @dev Update validator metrics (oracle only)
     */
    function updateValidatorMetrics(
        address validator, 
        ValidatorMetrics calldata metrics
    ) external override onlyOracle whenNotPaused {
        require(validator != address(0), "RiskOracle: validator cannot be zero address");
        require(metrics.performanceScore <= 10000, "RiskOracle: invalid performance score");
        require(metrics.uptime <= 10000, "RiskOracle: invalid uptime");

        validatorMetrics[validator] = metrics;
        
        uint256 riskScore = this.calculateSlashingRisk(validator);
        emit ValidatorScoreUpdated(validator, riskScore);
    }

    /**
     * @dev Update protocol metrics (oracle only)
     */
    function updateProtocolMetrics(
        address protocol, 
        ProtocolMetrics calldata metrics
    ) external override onlyOracle whenNotPaused {
        require(protocol != address(0), "RiskOracle: protocol cannot be zero address");
        require(metrics.utilization <= 10000, "RiskOracle: invalid utilization");
        require(metrics.securityScore <= 10000, "RiskOracle: invalid security score");
        require(metrics.auditScore <= 10000, "RiskOracle: invalid audit score");

        protocolMetrics[protocol] = metrics;
        
        uint256 riskScore = this.calculateSmartContractRisk(protocol);
        emit ProtocolScoreUpdated(protocol, riskScore);
    }

    /**
     * @dev Trigger emergency alert (emergency role only)
     */
    function triggerEmergencyAlert(
        address asset, 
        string calldata reason
    ) external override onlyEmergency {
        require(asset != address(0), "RiskOracle: asset cannot be zero address");
        
        emergencyStatus[asset] = true;
        uint256 riskScore = assetRiskMetrics[asset].compositeRisk;
        
        emit EmergencyAlert(asset, riskScore, reason);
    }

    /**
     * @dev Check if emergency is active for an asset
     */
    function isEmergencyActive(address asset) external view override returns (bool) {
        return emergencyStatus[asset];
    }

    /**
     * @dev Set risk threshold for an asset (risk manager only)
     */
    function setRiskThreshold(address asset, uint256 threshold) external override onlyRiskManager {
        require(asset != address(0), "RiskOracle: asset cannot be zero address");
        require(threshold <= MAX_RISK_SCORE, "RiskOracle: threshold exceeds maximum");
        
        riskThresholds[asset] = threshold;
    }

    /**
     * @dev Get risk threshold for an asset
     */
    function getRiskThreshold(address asset) external view override returns (uint256) {
        return riskThresholds[asset];
    }

    /**
     * @dev Update risk scoring weights (admin only)
     */
    function updateRiskWeights(
        uint256 _slashingWeight,
        uint256 _liquidityWeight,
        uint256 _smartContractWeight,
        uint256 _marketWeight
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            _slashingWeight + _liquidityWeight + _smartContractWeight + _marketWeight == 10000,
            "RiskOracle: weights must sum to 10000"
        );

        slashingWeight = _slashingWeight;
        liquidityWeight = _liquidityWeight;
        smartContractWeight = _smartContractWeight;
        marketWeight = _marketWeight;
    }

    /**
     * @dev Clear emergency status (emergency role only)
     */
    function clearEmergency(address asset) external onlyEmergency {
        require(asset != address(0), "RiskOracle: asset cannot be zero address");
        emergencyStatus[asset] = false;
    }

    /**
     * @dev Pause contract (admin only)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract (admin only)
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Check if risk data is stale
     */
    function isDataStale(address asset) external view returns (bool) {
        return block.timestamp - assetRiskMetrics[asset].lastUpdate > STALENESS_THRESHOLD;
    }

    /**
     * @dev Batch update multiple asset risk scores (oracle only)
     */
    function batchUpdateRiskScores(
        address[] calldata assets,
        uint256[] calldata scores
    ) external onlyOracle whenNotPaused {
        require(assets.length == scores.length, "RiskOracle: arrays length mismatch");
        
        for (uint256 i = 0; i < assets.length; i++) {
            this.updateRiskScore(assets[i], scores[i]);
        }
    }
} 