// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @title ISwellChainIntegration
 * @dev Interface for Swellchain-specific integrations including AVS services and cross-chain functionality
 */
interface ISwellChainIntegration {
    
    struct AVSMetrics {
        string name;
        address avsContract;
        uint256 totalStaked;
        uint256 performanceScore;
        uint256 slashingEvents;
        uint256 operatorCount;
        bool isActive;
    }
    
    struct CrossChainPosition {
        address token;
        uint256 amount;
        uint256 chainId;
        address bridge;
        uint256 lastUpdate;
    }
    
    struct SwellTokenMetrics {
        address token;
        uint256 exchangeRate;
        uint256 totalSupply;
        uint256 backingAssets;
        uint256 yieldRate;
        uint256 slashingRisk;
    }

    // Events
    event AVSMetricsUpdated(address indexed avs, uint256 performanceScore, uint256 slashingEvents);
    event CrossChainPositionUpdated(address indexed user, address token, uint256 amount, uint256 chainId);
    event SwellTokenMetricsUpdated(address indexed token, uint256 exchangeRate, uint256 yieldRate);
    event BridgeOperationInitiated(address indexed user, address token, uint256 amount, uint256 targetChainId);

    // AVS integration functions
    function getAVSMetrics(address avs) external view returns (AVSMetrics memory);
    function getMACHMetrics() external view returns (AVSMetrics memory);
    function getVITALMetrics() external view returns (AVSMetrics memory);
    function getSQUADMetrics() external view returns (AVSMetrics memory);
    function updateAVSMetrics(address avs, AVSMetrics calldata metrics) external;
    
    // Cross-chain position tracking
    function getCrossChainPosition(address user, address token) external view returns (CrossChainPosition memory);
    function updateCrossChainPosition(address user, CrossChainPosition calldata position) external;
    function getTotalCrossChainTVL(address token) external view returns (uint256);
    
    // Swell token integration
    function getSwellTokenMetrics(address token) external view returns (SwellTokenMetrics memory);
    function getSwETHMetrics() external view returns (SwellTokenMetrics memory);
    function getRswETHMetrics() external view returns (SwellTokenMetrics memory);
    function updateSwellTokenMetrics(address token, SwellTokenMetrics calldata metrics) external;
    
    // Bridge operations
    function initiateBridgeOperation(address token, uint256 amount, uint256 targetChainId) external;
    function getBridgeStatus(bytes32 operationId) external view returns (uint8 status);
    function claimBridgedTokens(bytes32 operationId) external;
    
    // Proof of Restake integration
    function getRestakingYield(address user, address strategy) external view returns (uint256);
    function getValidatorPerformance(address validator) external view returns (uint256 score, uint256 slashingRisk);
    function getEpochRewards(uint256 epoch) external view returns (uint256 totalRewards, uint256 userRewards);
    
    // SuperchainERC20 integration
    function getSuperchainBalance(address user, address token, uint256 chainId) external view returns (uint256);
    function initiateSuperchainTransfer(address token, uint256 amount, uint256 targetChainId, address recipient) external;
    function getSuperchainTokenInfo(address token) external view returns (bool isSupported, uint256[] memory supportedChains);
    
    // Utility functions
    function isSwellchainToken(address token) external view returns (bool);
    function getOptimalBridgeRoute(address token, uint256 amount, uint256 targetChainId) external view returns (address bridge, uint256 estimatedTime, uint256 estimatedCost);
    function getNetworkStatus() external view returns (bool isHealthy, uint256 finalityTime, uint256 gasPrice);
} 