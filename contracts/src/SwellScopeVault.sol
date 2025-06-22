// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./interfaces/ISwellScopeVault.sol";
import "./interfaces/IRiskOracle.sol";
import "./interfaces/ISwellChainIntegration.sol";

/**
 * @title SwellScopeVault
 * @dev Advanced restaking vault with integrated risk management for Swellchain ecosystem
 * @dev Follows ERC-4626 standard with Boring Vault architecture patterns
 * @dev Native integration with Swellchain's Proof of Restake and AVS services
 */
contract SwellScopeVault is ERC4626, ReentrancyGuard, Pausable, AccessControl, ISwellScopeVault {
    using Math for uint256;

    // Roles
    bytes32 public constant STRATEGIST_ROLE = keccak256("STRATEGIST_ROLE");
    bytes32 public constant RISK_MANAGER_ROLE = keccak256("RISK_MANAGER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // Risk management parameters
    uint256 public constant MAX_RISK_SCORE = 100;
    uint256 public constant MAX_SLIPPAGE = 500; // 5%
    uint256 public constant EMERGENCY_EXIT_THRESHOLD = 90; // 90% risk score
    
    // Fee structure (basis points)
    uint256 public managementFee = 50; // 0.5%
    uint256 public performanceFee = 1000; // 10%
    uint256 public constant MAX_MANAGEMENT_FEE = 200; // 2%
    uint256 public constant MAX_PERFORMANCE_FEE = 2000; // 20%

    // Integration contracts
    IRiskOracle public riskOracle;
    ISwellChainIntegration public swellChainIntegration;

    // Restaking strategies
    mapping(address => StrategyInfo) public strategies;
    address[] public strategyList;
    
    // User risk preferences
    mapping(address => RiskProfile) public userRiskProfiles;
    
    // AVS performance tracking
    mapping(address => AVSInfo) public avsServices;
    
    // Emergency exit state
    bool public emergencyExitTriggered;
    uint256 public lastRiskUpdate;

    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        address _riskOracle,
        address _swellChainIntegration
    ) ERC4626(_asset) ERC20(_name, _symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(STRATEGIST_ROLE, msg.sender);
        _grantRole(RISK_MANAGER_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        
        riskOracle = IRiskOracle(_riskOracle);
        swellChainIntegration = ISwellChainIntegration(_swellChainIntegration);
        
        lastRiskUpdate = block.timestamp;
    }

    /**
     * @dev Add a new restaking strategy to the vault
     */
    function addStrategy(
        address strategy,
        uint256 allocation,
        uint256 riskScore,
        uint256 expectedYield
    ) external override onlyRole(STRATEGIST_ROLE) {
        require(strategy != address(0), "Invalid strategy address");
        require(!strategies[strategy].active, "Strategy already exists");
        require(riskScore <= MAX_RISK_SCORE, "Risk score too high");
        require(getTotalAllocation() + allocation <= 10000, "Total allocation exceeds 100%");

        strategies[strategy] = StrategyInfo({
            active: true,
            allocation: allocation,
            riskScore: riskScore,
            expectedYield: expectedYield,
            tvl: 0,
            strategyAddress: strategy
        });
        
        strategyList.push(strategy);
        emit StrategyAdded(strategy, allocation, riskScore);
    }

    /**
     * @dev Remove a strategy from the vault
     */
    function removeStrategy(address strategy) external override onlyRole(STRATEGIST_ROLE) {
        require(strategies[strategy].active, "Strategy not active");
        
        // Exit the strategy position
        _exitStrategy(strategy);
        
        strategies[strategy].active = false;
        _removeFromStrategyList(strategy);
        
        emit StrategyRemoved(strategy);
    }

    /**
     * @dev Update user risk profile
     */
    function updateRiskProfile(
        uint256 maxRiskScore,
        bool autoRebalance
    ) external override {
        require(maxRiskScore <= MAX_RISK_SCORE, "Risk score too high");
        
        userRiskProfiles[msg.sender] = RiskProfile({
            maxRiskScore: maxRiskScore,
            preferredYield: 0, // Set based on risk tolerance
            autoRebalance: autoRebalance,
            lastRebalance: autoRebalance ? block.timestamp : 0
        });
        
        emit RiskProfileUpdated(msg.sender, maxRiskScore, autoRebalance);
        
        if (autoRebalance) {
            _executeAutoRebalance(msg.sender);
        }
    }

    /**
     * @dev Execute automatic rebalancing for a user
     */
    function executeAutoRebalance(address user) external override onlyRole(RISK_MANAGER_ROLE) {
        _executeAutoRebalance(user);
    }

    /**
     * @dev Trigger emergency exit from all strategies
     */
    function triggerEmergencyExit() external override onlyRole(EMERGENCY_ROLE) {
        emergencyExitTriggered = true;
        _pause();
        
        // Exit all strategies
        for (uint256 i = 0; i < strategyList.length; i++) {
            if (strategies[strategyList[i]].active) {
                _exitStrategy(strategyList[i]);
            }
        }
        
        emit EmergencyExitTriggered(getPortfolioRiskScore());
    }

    /**
     * @dev Update management and performance fees
     */
    function updateFees(
        uint256 _managementFee,
        uint256 _performanceFee
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_managementFee <= MAX_MANAGEMENT_FEE, "Management fee too high");
        require(_performanceFee <= MAX_PERFORMANCE_FEE, "Performance fee too high");
        
        managementFee = _managementFee;
        performanceFee = _performanceFee;
        
        emit FeesUpdated(_managementFee, _performanceFee);
    }

    /**
     * @dev Update AVS performance metrics
     */
    function updateAVSPerformance(
        address avs,
        uint256 performanceScore,
        uint256 slashingRisk
    ) external override onlyRole(RISK_MANAGER_ROLE) {
        require(performanceScore <= 100, "Performance score too high");
        require(slashingRisk <= 100, "Slashing risk too high");
        
        avsServices[avs].performanceScore = performanceScore;
        avsServices[avs].slashingRisk = slashingRisk;
        
        emit AVSPerformanceUpdated(avs, performanceScore, slashingRisk);
        
        // Check if emergency exit should be triggered
        if (slashingRisk >= EMERGENCY_EXIT_THRESHOLD && !emergencyExitTriggered) {
            this.triggerEmergencyExit();
        }
    }

    /**
     * @dev Get the total allocation across all strategies
     */
    function getTotalAllocation() public view override returns (uint256) {
        uint256 totalAllocation = 0;
        for (uint256 i = 0; i < strategyList.length; i++) {
            if (strategies[strategyList[i]].active) {
                totalAllocation += strategies[strategyList[i]].allocation;
            }
        }
        return totalAllocation;
    }

    /**
     * @dev Get portfolio risk score
     */
    function getPortfolioRiskScore() public view override returns (uint256) {
        if (strategyList.length == 0) return 0;
        
        uint256 weightedRisk = 0;
        uint256 totalAllocation = getTotalAllocation();
        
        if (totalAllocation == 0) return 0;
        
        for (uint256 i = 0; i < strategyList.length; i++) {
            if (strategies[strategyList[i]].active) {
                StrategyInfo memory strategy = strategies[strategyList[i]];
                weightedRisk += (strategy.riskScore * strategy.allocation) / totalAllocation;
            }
        }
        
        return weightedRisk;
    }

    /**
     * @dev Get user risk profile
     */
    function getUserRiskProfile(address user) external view override returns (RiskProfile memory) {
        return userRiskProfiles[user];
    }

    /**
     * @dev Get strategy info
     */
    function getStrategyInfo(address strategy) external view override returns (StrategyInfo memory) {
        return strategies[strategy];
    }

    /**
     * @dev Get active strategies
     */
    function getActiveStrategies() external view override returns (address[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < strategyList.length; i++) {
            if (strategies[strategyList[i]].active) {
                activeCount++;
            }
        }
        
        address[] memory activeStrategies = new address[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < strategyList.length; i++) {
            if (strategies[strategyList[i]].active) {
                activeStrategies[index] = strategyList[i];
                index++;
            }
        }
        
        return activeStrategies;
    }

    // Internal helper functions
    function _executeAutoRebalance(address user) internal {
        RiskProfile memory profile = userRiskProfiles[user];
        if (!profile.autoRebalance) return;
        
        uint256 currentRisk = getPortfolioRiskScore();
        if (currentRisk <= profile.maxRiskScore) return;
        
        // Simple rebalancing logic - reduce high-risk strategy allocations
        for (uint256 i = 0; i < strategyList.length; i++) {
            address strategy = strategyList[i];
            if (strategies[strategy].active && strategies[strategy].riskScore > profile.maxRiskScore) {
                uint256 oldAllocation = strategies[strategy].allocation;
                uint256 newAllocation = oldAllocation * profile.maxRiskScore / strategies[strategy].riskScore;
                strategies[strategy].allocation = newAllocation;
                
                emit AutoRebalanceExecuted(user, oldAllocation, newAllocation);
            }
        }
        
        userRiskProfiles[user].lastRebalance = block.timestamp;
    }

    function _exitStrategy(address strategy) internal {
        // This would implement the actual strategy exit logic
        // For now, just mark as inactive
        strategies[strategy].tvl = 0;
    }

    function _removeFromStrategyList(address strategy) internal {
        for (uint256 i = 0; i < strategyList.length; i++) {
            if (strategyList[i] == strategy) {
                strategyList[i] = strategyList[strategyList.length - 1];
                strategyList.pop();
                break;
            }
        }
    }
} 