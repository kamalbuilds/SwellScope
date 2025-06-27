# SwellScopeVault Contract

## Overview

The `SwellScopeVault` is the core smart contract of the SwellScope platform, implementing an advanced ERC-4626 compliant restaking vault with integrated risk management for the Swellchain ecosystem. It follows Boring Vault architecture patterns and provides native integration with Swellchain's Proof of Restake and AVS services.

## Contract Architecture

### Core Features

- **ERC-4626 Compliance**: Standard vault interface for deposits, withdrawals, and yield calculation
- **Risk Management**: Real-time risk assessment and automated risk controls
- **Strategy Management**: Multiple restaking strategies with dynamic allocation
- **Auto-Rebalancing**: Automatic portfolio rebalancing based on user risk preferences
- **Emergency Controls**: Emergency exit mechanisms and circuit breakers
- **Fee Management**: Configurable management and performance fees
- **AVS Integration**: Native integration with Swellchain AVS services

### Inheritance Structure

```solidity
SwellScopeVault is ERC4626, ReentrancyGuard, Pausable, AccessControl, ISwellScopeVault
```

## Role-Based Access Control

### Roles

| Role | Purpose | Permissions |
|------|---------|-------------|
| `DEFAULT_ADMIN_ROLE` | Contract administration | Fee updates, role management |
| `STRATEGIST_ROLE` | Strategy management | Add/remove strategies, allocations |
| `RISK_MANAGER_ROLE` | Risk operations | Risk profile updates, rebalancing |
| `EMERGENCY_ROLE` | Emergency operations | Emergency exit, contract pausing |

### Role Assignments

```solidity
bytes32 public constant STRATEGIST_ROLE = keccak256("STRATEGIST_ROLE");
bytes32 public constant RISK_MANAGER_ROLE = keccak256("RISK_MANAGER_ROLE");
bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
```

## Core Data Structures

### StrategyInfo

```solidity
struct StrategyInfo {
    bool active;              // Strategy status
    uint256 allocation;       // Allocation percentage (basis points)
    uint256 riskScore;        // Risk score (0-100)
    uint256 expectedYield;    // Expected yield (basis points)
    uint256 tvl;              // Total Value Locked
    address strategyAddress;  // Strategy contract address
}
```

### RiskProfile

```solidity
struct RiskProfile {
    uint256 maxRiskScore;     // Maximum acceptable risk score
    uint256 preferredYield;   // Preferred yield target
    bool autoRebalance;       // Auto-rebalancing enabled
    uint256 lastRebalance;    // Last rebalance timestamp
}
```

### AVSInfo

```solidity
struct AVSInfo {
    uint256 performanceScore; // Performance score (0-100)
    uint256 slashingRisk;     // Slashing risk score (0-100)
    bool isActive;            // AVS active status
}
```

## Core Functions

### Constructor

```solidity
constructor(
    IERC20 _asset,
    string memory _name,
    string memory _symbol,
    address _riskOracle,
    address _swellChainIntegration
)
```

Initializes the vault with the underlying asset and integration contracts.

### Strategy Management

#### addStrategy

```solidity
function addStrategy(
    address strategy,
    uint256 allocation,
    uint256 riskScore,
    uint256 expectedYield
) external override onlyRole(STRATEGIST_ROLE)
```

Adds a new restaking strategy to the vault with specified parameters.

**Parameters:**
- `strategy`: Strategy contract address
- `allocation`: Allocation percentage in basis points (0-10000)
- `riskScore`: Risk score (0-100)
- `expectedYield`: Expected yield in basis points

**Requirements:**
- Caller must have `STRATEGIST_ROLE`
- Strategy address must be valid
- Strategy must not already exist
- Risk score must not exceed `MAX_RISK_SCORE`
- Total allocation must not exceed 100%

#### removeStrategy

```solidity
function removeStrategy(address strategy) external override onlyRole(STRATEGIST_ROLE)
```

Removes a strategy from the vault and exits all positions.

### Risk Management

#### updateRiskProfile

```solidity
function updateRiskProfile(
    uint256 maxRiskScore,
    bool autoRebalance
) external override
```

Updates the user's risk profile and triggers auto-rebalancing if enabled.

**Parameters:**
- `maxRiskScore`: Maximum acceptable risk score (0-100)
- `autoRebalance`: Enable/disable automatic rebalancing

#### executeAutoRebalance

```solidity
function executeAutoRebalance(address user) external override onlyRole(RISK_MANAGER_ROLE)
```

Manually triggers auto-rebalancing for a specific user.

### Emergency Controls

#### triggerEmergencyExit

```solidity
function triggerEmergencyExit() external override onlyRole(EMERGENCY_ROLE)
```

Triggers emergency exit from all strategies and pauses the contract.

**Effects:**
- Sets `emergencyExitTriggered` to true
- Pauses the contract
- Exits all active strategies
- Emits `EmergencyExitTriggered` event

### Fee Management

#### updateFees

```solidity
function updateFees(
    uint256 _managementFee,
    uint256 _performanceFee
) external override onlyRole(DEFAULT_ADMIN_ROLE)
```

Updates management and performance fees.

**Constraints:**
- Management fee ≤ 2% (200 basis points)
- Performance fee ≤ 20% (2000 basis points)

### AVS Integration

#### updateAVSPerformance

```solidity
function updateAVSPerformance(
    address avs,
    uint256 performanceScore,
    uint256 slashingRisk
) external override onlyRole(RISK_MANAGER_ROLE)
```

Updates AVS performance metrics and triggers emergency exit if slashing risk is too high.

## Configuration Parameters

### Risk Parameters

```solidity
uint256 public constant MAX_RISK_SCORE = 100;
uint256 public constant MAX_SLIPPAGE = 500; // 5%
uint256 public constant EMERGENCY_EXIT_THRESHOLD = 90; // 90% risk score
```

### Fee Structure

```solidity
uint256 public managementFee = 50; // 0.5%
uint256 public performanceFee = 1000; // 10%
uint256 public constant MAX_MANAGEMENT_FEE = 200; // 2%
uint256 public constant MAX_PERFORMANCE_FEE = 2000; // 20%
```

## Events

### Strategy Events

```solidity
event StrategyAdded(address indexed strategy, uint256 allocation, uint256 riskScore);
event StrategyRemoved(address indexed strategy);
event StrategyRebalanced(address indexed strategy, uint256 newAllocation);
```

### Risk Events

```solidity
event RiskProfileUpdated(address indexed user, uint256 maxRiskScore, bool autoRebalance);
event AutoRebalanceExecuted(address indexed user, uint256 timestamp);
event EmergencyExitTriggered(uint256 portfolioRiskScore);
```

### Fee Events

```solidity
event FeesUpdated(uint256 managementFee, uint256 performanceFee);
event FeesCollected(uint256 managementFees, uint256 performanceFees);
```

### AVS Events

```solidity
event AVSPerformanceUpdated(address indexed avs, uint256 performanceScore, uint256 slashingRisk);
```

## Usage Examples

### Basic Vault Interaction

```solidity
// Deploy vault
SwellScopeVault vault = new SwellScopeVault(
    IERC20(swETH_ADDRESS),
    "SwellScope swETH Vault",
    "ssSwETH",
    RISK_ORACLE_ADDRESS,
    SWELLCHAIN_INTEGRATION_ADDRESS
);

// Deposit tokens
IERC20(swETH_ADDRESS).approve(address(vault), amount);
vault.deposit(amount, user);

// Set risk profile
vault.updateRiskProfile(75, true); // 75% max risk, auto-rebalance enabled
```

### Strategy Management

```solidity
// Add a new strategy
vault.addStrategy(
    strategyAddress,
    2500, // 25% allocation
    60,   // 60% risk score
    800   // 8% expected yield
);

// Remove strategy
vault.removeStrategy(strategyAddress);
```

### Emergency Operations

```solidity
// Trigger emergency exit (EMERGENCY_ROLE required)
vault.triggerEmergencyExit();

// Pause contract (EMERGENCY_ROLE required)
vault.pause();
```

## Integration with Swellchain

### Supported Assets

- **swETH**: Swell Liquid Staking Token
- **rswETH**: Swell Restaking Token (when available)

### AVS Integration

The vault integrates with Swellchain AVS services:

- **MACH**: Fast finality service
- **VITAL**: State verification (future)
- **SQUAD**: Decentralized sequencing (future)

### Cross-Chain Compatibility

Built for seamless integration with:
- Ethereum mainnet (origin chain)
- Swellchain L2 (execution layer)
- SuperchainERC20 standard for cross-chain operations

## Security Features

### Access Controls

- Role-based permissions for all critical functions
- Multi-signature requirements for admin operations
- Time-locked upgrades for parameter changes

### Risk Management

- Real-time risk monitoring via RiskOracle
- Automatic emergency exit triggers
- Slippage protection for all operations
- Maximum exposure limits per strategy

### Circuit Breakers

- Emergency pause functionality
- Automatic position exits on high risk
- Rate limiting for large operations

## Gas Optimization

### Efficient Operations

- Batch operations for multiple strategies
- Optimized storage patterns
- Minimal external calls during normal operations

### Cost-Effective Rebalancing

- Off-chain calculation with on-chain verification
- Threshold-based rebalancing to reduce frequency
- Gas-efficient strategy allocation updates

## Deployment Configuration

### Constructor Parameters

```solidity
// Swellchain Mainnet
SwellScopeVault vault = new SwellScopeVault(
    IERC20(0x...swETH_ADDRESS),      // swETH token
    "SwellScope swETH Vault",         // Vault name
    "ssSwETH",                        // Vault symbol
    0x...RISK_ORACLE_ADDRESS,         // RiskOracle contract
    0x...SWELLCHAIN_INTEGRATION_ADDRESS // SwellChainIntegration contract
);
```

### Initial Setup

1. Deploy contract with proper constructor parameters
2. Grant roles to appropriate addresses
3. Configure initial fee structure
4. Add initial restaking strategies
5. Set emergency thresholds
6. Enable auto-rebalancing

## Monitoring and Analytics

### Key Metrics

- Total Value Locked (TVL)
- Average risk score across strategies
- Yield performance vs. benchmarks
- Auto-rebalancing frequency
- Emergency exit triggers

### Integration Points

- RiskOracle for real-time risk data
- SwellChainIntegration for cross-chain positions
- AVS performance monitoring
- Yield calculation and distribution

## Future Enhancements

### Planned Features

- Multi-asset vault support
- Advanced strategy composition
- Governance token integration
- Cross-chain yield farming
- MEV protection mechanisms

### Upgrade Path

The contract follows a modular architecture that supports:
- Strategy plugin system
- Oracle upgrades
- Fee model adjustments
- Risk framework evolution 