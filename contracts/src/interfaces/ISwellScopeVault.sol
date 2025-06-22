// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/interfaces/IERC4626.sol";

/**
 * @title ISwellScopeVault
 * @dev Interface for SwellScope vault with advanced risk management
 */
interface ISwellScopeVault is IERC4626 {
    
    struct StrategyInfo {
        bool active;
        uint256 allocation;
        uint256 riskScore;
        uint256 expectedYield;
        uint256 tvl;
        address strategyAddress;
    }
    
    struct RiskProfile {
        uint256 maxRiskScore;
        uint256 preferredYield;
        bool autoRebalance;
        uint256 lastRebalance;
    }
    
    struct AVSInfo {
        string name;
        uint256 performanceScore;
        uint256 slashingRisk;
        bool isActive;
        uint256 totalStaked;
    }

    // Events
    event StrategyAdded(address indexed strategy, uint256 allocation, uint256 riskScore);
    event StrategyRemoved(address indexed strategy);
    event RiskProfileUpdated(address indexed user, uint256 maxRisk, bool autoRebalance);
    event EmergencyExitTriggered(uint256 riskScore);
    event AutoRebalanceExecuted(address indexed user, uint256 oldAllocation, uint256 newAllocation);
    event FeesUpdated(uint256 managementFee, uint256 performanceFee);
    event AVSPerformanceUpdated(address indexed avs, uint256 score, uint256 slashingRisk);

    // Strategy management
    function addStrategy(address strategy, uint256 allocation, uint256 riskScore, uint256 expectedYield) external;
    function removeStrategy(address strategy) external;
    function updateRiskProfile(uint256 maxRiskScore, bool autoRebalance) external;
    function executeAutoRebalance(address user) external;
    function triggerEmergencyExit() external;
    
    // Fee management
    function updateFees(uint256 managementFee, uint256 performanceFee) external;
    
    // AVS management
    function updateAVSPerformance(address avs, uint256 performanceScore, uint256 slashingRisk) external;
    
    // View functions
    function getTotalAllocation() external view returns (uint256);
    function getPortfolioRiskScore() external view returns (uint256);
    function getUserRiskProfile(address user) external view returns (RiskProfile memory);
    function getStrategyInfo(address strategy) external view returns (StrategyInfo memory);
    function getActiveStrategies() external view returns (address[] memory);
} 