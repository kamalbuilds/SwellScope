// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
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
    
    struct StrategyInfo {
        bool active;
        uint256 allocation; // basis points (10000 = 100%)
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
     * @param strategy Address of the strategy contract
     * @param allocation Allocation percentage in basis points
     * @param riskScore Risk score of the strategy (0-100)
     * @param expectedYield Expected annual yield in basis points
     */
    function addStrategy(
        address strategy,
        uint256 allocation,
        uint256 riskScore,
        uint256 expectedYield
    ) external onlyRole(STRATEGIST_ROLE) {
        require(strategy != address(0), "Invalid strategy address");
        require(!strategies[strategy].active, "Strategy already exists");
        require(riskScore <= MAX_RISK_SCORE, "Risk score too high");
        require(_getTotalAllocation() + allocation <= 10000, "Total allocation exceeds 100%");

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
     * @param strategy Address of the strategy to remove
     */
    function removeStrategy(address strategy) external onlyRole(STRATEGIST_ROLE) {
        require(strategies[strategy].active, "Strategy not active");
        
        // Exit the strategy position
        _exitStrategy(strategy);
        
        strategies[strategy].active = false;
        _removeFromStrategyList(strategy);
        
        emit StrategyRemoved(strategy);
    }

    /**
     * @dev Update user risk profile
     * @param maxRiskScore Maximum acceptable risk score
     * @param autoRebalance Enable automatic rebalancing
     */
    function updateRiskProfile(
        uint256 maxRiskScore,
        bool autoRebalance
    ) external {
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
     * @param user Address of the user
     */
    function executeAutoRebalance(address user) external onlyRole(RISK_MANAGER_ROLE) {
        _executeAutoRebalance(user);
    }

    /**
     * @dev Trigger emergency exit from all strategies
     */
    function triggerEmergencyExit() external onlyRole(EMERGENCY_ROLE) {
        emergencyExitTriggered = true;
        _pause();
        
        // Exit all strategies
        for (uint256 i = 0; i < strategyList.length; i++) {
            if (strategies[strategyList[i]].active) {
                _exitStrategy(strategyList[i]);
            }
        }
        
        emit EmergencyExitTriggered(_getPortfolioRiskScore());
    }

    /**
     * @dev Update management and performance fees
     * @param _managementFee New management fee in basis points
     * @param _performanceFee New performance fee in basis points
     */
    function updateFees(
        uint256 _managementFee,
        uint256 _performanceFee
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_managementFee <= MAX_MANAGEMENT_FEE, "Management fee too high");
        require(_performanceFee <= MAX_PERFORMANCE_FEE, "Performance fee too high");
        
        managementFee = _managementFee;
        performanceFee = _performanceFee;
        
        emit FeesUpdated(_managementFee, _performanceFee);
    }

    /**
     * @dev Update AVS performance metrics
     * @param avs Address of the AVS service
     * @param performanceScore Performance score (0-100)
     * @param slashingRisk Slashing risk score (0-100)
     */
    function updateAVSPerformance(
        address avs,
        uint256 performanceScore,
        uint256 slashingRisk
    ) external onlyRole(RISK_MANAGER_ROLE) {
        require(performanceScore <= 100, "Performance score too high");
        require(slashingRisk <= 100, "Slashing risk too high");
        
        avsServices[avs].performanceScore = performanceScore;
        avsServices[avs].slashingRisk = slashingRisk;
        
        emit AVSPerformanceUpdated(avs, performanceScore, slashingRisk);
        
        // Check if emergency exit should be triggered
        if (slashingRisk >= EMERGENCY_EXIT_THRESHOLD && !emergencyExitTriggered) {
            triggerEmergencyExit();
        }
    }

    /**
     * @dev Get the total allocation across all strategies
     * @return Total allocation in basis points
     */
    function getTotalAllocation() external view returns (uint256) {
        return _getTotalAllocation();
    }

    /**
     * @dev Get the portfolio risk score
     * @return Weighted average risk score
     */
    function getPortfolioRiskScore() external view returns (uint256) {
        return _getPortfolioRiskScore();
    }

    /**
     * @dev Get user's risk profile
     * @param user Address of the user
     * @return RiskProfile struct
     */
    function getUserRiskProfile(address user) external view returns (RiskProfile memory) {
        return userRiskProfiles[user];
    }

    /**
     * @dev Get strategy information
     * @param strategy Address of the strategy
     * @return StrategyInfo struct
     */
    function getStrategyInfo(address strategy) external view returns (StrategyInfo memory) {
        return strategies[strategy];
    }

    /**
     * @dev Get all active strategies
     * @return Array of strategy addresses
     */
    function getActiveStrategies() external view returns (address[] memory) {
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

    // Internal functions
    function _getTotalAllocation() internal view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < strategyList.length; i++) {
            if (strategies[strategyList[i]].active) {
                total += strategies[strategyList[i]].allocation;
            }
        }
        return total;
    }

    function _getPortfolioRiskScore() internal view returns (uint256) {
        uint256 weightedRisk = 0;
        uint256 totalAllocation = 0;
        
        for (uint256 i = 0; i < strategyList.length; i++) {
            if (strategies[strategyList[i]].active) {
                StrategyInfo memory strategy = strategies[strategyList[i]];
                weightedRisk += strategy.riskScore * strategy.allocation;
                totalAllocation += strategy.allocation;
            }
        }
        
        return totalAllocation > 0 ? weightedRisk / totalAllocation : 0;
    }

    function _executeAutoRebalance(address user) internal {
        RiskProfile memory profile = userRiskProfiles[user];
        require(profile.autoRebalance, "Auto rebalancing not enabled");
        
        uint256 currentRisk = _getPortfolioRiskScore();
        if (currentRisk <= profile.maxRiskScore) {
            return; // No rebalancing needed
        }
        
        // Calculate new allocations to reduce risk
        uint256 oldAllocation = _getTotalAllocation();
        uint256 newAllocation = _calculateOptimalAllocation(profile.maxRiskScore);
        
        // Execute rebalancing logic here
        userRiskProfiles[user].lastRebalance = block.timestamp;
        
        emit AutoRebalanceExecuted(user, oldAllocation, newAllocation);
    }

    function _calculateOptimalAllocation(uint256 maxRisk) internal view returns (uint256) {
        // Implement optimization algorithm to find best allocation within risk constraints
        // This is a simplified version - production would use more sophisticated optimization
        return maxRisk * 100; // Placeholder calculation
    }

    function _exitStrategy(address strategy) internal {
        // Implement strategy exit logic
        // This would interact with the specific strategy contract to withdraw funds
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

    // Override ERC4626 functions to add risk management
    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override nonReentrant whenNotPaused {
        // Check if deposit would exceed risk limits
        require(!emergencyExitTriggered, "Emergency exit active");
        
        super._deposit(caller, receiver, assets, shares);
        
        // Update risk metrics after deposit
        lastRiskUpdate = block.timestamp;
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override nonReentrant {
        super._withdraw(caller, receiver, owner, assets, shares);
        
        // Update risk metrics after withdrawal
        lastRiskUpdate = block.timestamp;
    }
} 