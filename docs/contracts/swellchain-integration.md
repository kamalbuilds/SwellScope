# SwellChainIntegration Contract

## Overview

The `SwellChainIntegration` contract provides production-ready integration with Swellchain protocols, AVS services, and cross-chain functionality. It serves as the primary interface for interacting with real deployed contracts on Swellchain, including swETH/rswETH tokens, MACH AVS, and the Nucleus protocol.

## Contract Architecture

### Core Functionality

- **Real Swellchain Integration**: Direct integration with deployed Swellchain contracts
- **AVS Service Monitoring**: Real-time tracking of MACH AVS performance
- **Cross-Chain Position Management**: Position tracking across Ethereum and Swellchain
- **Token Metrics**: Comprehensive metrics for swETH and rswETH
- **Bridge Operations**: Integration with Swellchain Standard Bridge
- **Validator Performance**: Real-time validator monitoring and risk assessment

### Inheritance Structure

```solidity
SwellChainIntegration is ISwellChainIntegration, AccessControl, ReentrancyGuard, Pausable
```

## Role-Based Access Control

### Roles

| Role | Purpose | Permissions |
|------|---------|-------------|
| `DEFAULT_ADMIN_ROLE` | Contract administration | Role management, configuration |
| `OPERATOR_ROLE` | Operations management | Position updates, metrics updates |
| `BRIDGE_ROLE` | Bridge operations | Cross-chain transaction management |
| `ORACLE_ROLE` | Data provision | AVS metrics, validator performance updates |

### Role Implementation

```solidity
bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");
bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
```

## Real Contract Addresses

### Swellchain Token Contracts

```solidity
IERC20 public immutable swETH;        // Swell Liquid Staking Token
IERC20 public immutable rswETH;       // Swell Restaking Token (when available)
```

### Infrastructure Contracts

```solidity
address public immutable standardBridge;     // Swellchain Standard Bridge
address public immutable machServiceManager; // MACH AVS Service Manager
address public immutable nucleusBoringVault; // Nucleus Boring Vault
address public immutable nucleusManager;     // Nucleus Manager Contract
```

## Data Structures

### AVSMetrics

```solidity
struct AVSMetrics {
    string name;                  // AVS service name
    address avsContract;          // AVS contract address
    uint256 totalStaked;          // Total staked amount
    uint256 performanceScore;     // Performance score (0-10000)
    uint256 slashingEvents;       // Number of slashing events
    uint256 operatorCount;        // Number of operators
    bool isActive;                // AVS active status
}
```

### CrossChainPosition

```solidity
struct CrossChainPosition {
    address token;                // Token address
    uint256 amount;               // Position amount
    uint256 chainId;              // Chain ID
    uint256 lastUpdate;           // Last update timestamp
    bool isActive;                // Position active status
}
```

### SwellTokenMetrics

```solidity
struct SwellTokenMetrics {
    uint256 totalSupply;          // Total token supply
    uint256 stakingApr;           // Staking APR
    uint256 restakingYield;       // Restaking yield
    uint256 tvl;                  // Total Value Locked
    uint256 exchangeRate;         // ETH exchange rate
    uint256 lastUpdate;           // Last metrics update
}
```

### BridgeOperation

```solidity
struct BridgeOperation {
    address user;                 // User address
    address token;                // Token being bridged
    uint256 amount;               // Bridge amount
    uint256 targetChainId;        // Target chain ID
    uint8 status;                 // Operation status (0: pending, 1: confirmed, 2: failed)
    uint256 timestamp;            // Operation timestamp
}
```

### ValidatorPerformance

```solidity
struct ValidatorPerformance {
    uint256 score;                // Performance score
    uint256 slashingRisk;         // Slashing risk assessment
    uint256 lastUpdate;           // Last update timestamp
}
```

## Core Functions

### Constructor

```solidity
constructor(
    address admin,
    address _swETH,
    address _rswETH,
    address _standardBridge,
    address _machServiceManager,
    address _nucleusBoringVault,
    address _nucleusManager
)
```

Initializes the contract with real Swellchain contract addresses.

**Parameters:**
- `admin`: Administrative address
- `_swETH`: swETH token contract address
- `_rswETH`: rswETH token contract address (optional)
- `_standardBridge`: Swellchain Standard Bridge address
- `_machServiceManager`: MACH AVS Service Manager address
- `_nucleusBoringVault`: Nucleus Boring Vault address
- `_nucleusManager`: Nucleus Manager contract address

### AVS Service Integration

#### getAVSMetrics

```solidity
function getAVSMetrics(address avs) external view override returns (AVSMetrics memory)
```

Returns comprehensive metrics for a supported AVS service.

#### getMACHMetrics

```solidity
function getMACHMetrics() external view override returns (AVSMetrics memory)
```

Returns metrics for the MACH AVS service (fast finality).

**MACH AVS Features:**
- Fast finality for Swellchain blocks
- Reduced confirmation times
- Enhanced security through restaking
- Real-time performance monitoring

#### getVITALMetrics

```solidity
function getVITALMetrics() external pure override returns (AVSMetrics memory)
```

Returns empty metrics as VITAL AVS is not currently deployed.

#### getSQUADMetrics

```solidity
function getSQUADMetrics() external pure override returns (AVSMetrics memory)
```

Returns empty metrics as SQUAD AVS is not currently deployed.

#### updateAVSMetrics

```solidity
function updateAVSMetrics(address avs, AVSMetrics calldata metrics) external override onlyOracle
```

Updates AVS metrics for supported services (oracle only).

### Cross-Chain Position Management

#### getCrossChainPosition

```solidity
function getCrossChainPosition(address user, address token) external view override returns (CrossChainPosition memory)
```

Retrieves cross-chain position data for a user and token.

#### updateCrossChainPosition

```solidity
function updateCrossChainPosition(address user, CrossChainPosition calldata position) external override onlyOperator
```

Updates cross-chain position data (operator only).

#### getTotalCrossChainTVL

```solidity
function getTotalCrossChainTVL(address token) external view override returns (uint256)
```

Returns total cross-chain TVL for a supported token.

### Swell Token Integration

#### getSwellTokenMetrics

```solidity
function getSwellTokenMetrics(address token) external view override returns (SwellTokenMetrics memory)
```

Returns comprehensive metrics for swETH or rswETH tokens.

**Token Metrics Include:**
- Current staking APR
- Restaking yield rates
- Total Value Locked
- ETH exchange rates
- Supply information

#### updateSwellTokenMetrics

```solidity
function updateSwellTokenMetrics(address token, SwellTokenMetrics calldata metrics) external override onlyOracle
```

Updates token metrics (oracle only).

### Bridge Operations

#### initiateBridgeDeposit

```solidity
function initiateBridgeDeposit(address token, uint256 amount, uint256 targetChainId) external override
```

Initiates a bridge deposit operation.

**Supported Routes:**
- Ethereum → Swellchain
- Swellchain → Ethereum

#### processBridgeWithdrawal

```solidity
function processBridgeWithdrawal(bytes32 operationId) external override onlyBridge
```

Processes a bridge withdrawal operation.

#### getBridgeOperation

```solidity
function getBridgeOperation(bytes32 operationId) external view override returns (BridgeOperation memory)
```

Retrieves bridge operation details.

### Validator Performance

#### getValidatorPerformance

```solidity
function getValidatorPerformance(address validator) external view override returns (ValidatorPerformance memory)
```

Returns validator performance metrics.

#### updateValidatorPerformance

```solidity
function updateValidatorPerformance(address validator, ValidatorPerformance calldata performance) external override onlyOracle
```

Updates validator performance data (oracle only).

## Supported Networks

### Swellchain Mainnet

```typescript
const SWELLCHAIN_MAINNET = {
  chainId: 1923,
  name: 'Swellchain',
  rpcUrls: ['https://swell-mainnet.alt.technology'],
  blockExplorer: 'https://explorer.swellnetwork.io'
}
```

### Swellchain Testnet

```typescript
const SWELLCHAIN_TESTNET = {
  chainId: 1924,
  name: 'Swellchain Testnet',
  rpcUrls: ['https://swell-testnet.alt.technology'],
  blockExplorer: 'https://swell-testnet-explorer.alt.technology'
}
```

## AVS Service Integration

### MACH (Machine-level Agreement for Continuous Hosting)

MACH is the primary AVS service providing fast finality for Swellchain:

**Features:**
- Sub-second block finality
- Enhanced security through restaking
- Reduced confirmation times
- MEV protection

**Integration:**
```solidity
// Get MACH performance metrics
AVSMetrics memory machMetrics = integration.getMACHMetrics();

// Monitor MACH performance
require(machMetrics.performanceScore > 8000, "MACH performance below threshold");
```

### Future AVS Services

**VITAL (Verification and Integrity Through Advanced Logic):**
- State verification service
- Cross-chain proof validation
- Currently in development

**SQUAD (Sequencer Quality and Uptime Assurance Decentralized):**
- Decentralized sequencer network
- Uptime guarantees
- Future deployment planned

## Real Protocol Integrations

### swETH Integration

```solidity
// swETH metrics
SwellTokenMetrics memory swethMetrics = integration.getSwellTokenMetrics(swETH_ADDRESS);

// Current staking APR
uint256 stakingApr = swethMetrics.stakingApr;

// Exchange rate
uint256 ethPerSweth = swethMetrics.exchangeRate;
```

### Nucleus Protocol Integration

Integration with Nucleus Boring Vault architecture:

```solidity
// Access Nucleus contracts
address nucleusVault = integration.nucleusBoringVault();
address nucleusManager = integration.nucleusManager();

// Nucleus integration for institutional-grade strategies
```

### Bridge Integration

```solidity
// Deposit to Swellchain
integration.initiateBridgeDeposit(
    swETH_ADDRESS,
    depositAmount,
    1923 // Swellchain mainnet
);

// Monitor bridge operation
BridgeOperation memory operation = integration.getBridgeOperation(operationId);
```

## Events

### AVS Events

```solidity
event AVSMetricsUpdated(address indexed avs, uint256 performanceScore, uint256 slashingEvents);
event AVSInitialized(address indexed avs, string name);
```

### Cross-Chain Events

```solidity
event CrossChainPositionUpdated(address indexed user, address token, uint256 amount, uint256 chainId);
event CrossChainPositionSynced(address indexed user, address token, uint256 amount);
```

### Bridge Events

```solidity
event BridgeDepositInitiated(address indexed user, address token, uint256 amount, uint256 targetChain);
event BridgeWithdrawalProcessed(bytes32 indexed operationId, address user, uint256 amount);
```

### Token Events

```solidity
event SwellTokenMetricsUpdated(address indexed token, uint256 apr, uint256 tvl);
event ValidatorPerformanceUpdated(address indexed validator, uint256 score, uint256 risk);
```

## Usage Examples

### Basic Integration Setup

```solidity
// Deploy integration contract
SwellChainIntegration integration = new SwellChainIntegration(
    ADMIN_ADDRESS,
    SWETH_ADDRESS,
    RSWETH_ADDRESS,
    STANDARD_BRIDGE_ADDRESS,
    MACH_SERVICE_MANAGER_ADDRESS,
    NUCLEUS_BORING_VAULT_ADDRESS,
    NUCLEUS_MANAGER_ADDRESS
);
```

### AVS Monitoring

```solidity
// Monitor MACH AVS performance
AVSMetrics memory machMetrics = integration.getMACHMetrics();

if (machMetrics.performanceScore < 8000) {
    // Alert on poor performance
    emit PerformanceAlert(machMetrics.avsContract, machMetrics.performanceScore);
}

// Check for slashing events
if (machMetrics.slashingEvents > lastKnownSlashingEvents) {
    // Handle slashing event
    handleSlashingEvent(machMetrics.avsContract);
}
```

### Cross-Chain Position Tracking

```solidity
// Track user position across chains
CrossChainPosition memory ethPosition = integration.getCrossChainPosition(user, swETH_ADDRESS);
uint256 totalTVL = integration.getTotalCrossChainTVL(swETH_ADDRESS);

// Calculate user's share of total TVL
uint256 userShare = (ethPosition.amount * 10000) / totalTVL;
```

### Bridge Operations

```solidity
// Initiate bridge deposit
integration.initiateBridgeDeposit(swETH_ADDRESS, 10 ether, 1923);

// Monitor bridge status
BridgeOperation memory operation = integration.getBridgeOperation(operationId);
require(operation.status != 2, "Bridge operation failed");
```

## Security Features

### Access Controls

- Role-based permissions for all critical functions
- Multi-signature requirements for admin operations
- Bridge role restricted to official bridge contracts

### Data Validation

- Sanity checks for all metric updates
- Address validation for supported tokens and AVS
- Cross-chain position validation

### Emergency Controls

- Circuit breakers for AVS performance degradation
- Emergency pause for all operations
- Validator blacklisting capabilities

## Integration Patterns

### Risk Assessment Integration

```solidity
// Integrate with RiskOracle
uint256 machRisk = riskOracle.calculateAVSRisk(machServiceManager);
AVSMetrics memory metrics = integration.getMACHMetrics();

// Adjust positions based on AVS performance
if (metrics.performanceScore < 7000 || machRisk > 8000) {
    vault.reduceAVSExposure(machServiceManager);
}
```

### Yield Optimization

```solidity
// Get current yields
SwellTokenMetrics memory swethMetrics = integration.getSwellTokenMetrics(swETH_ADDRESS);

// Compare yields and optimize allocation
if (swethMetrics.restakingYield > swethMetrics.stakingApr + 200) {
    // Favor restaking over staking
    vault.increaseRestakingAllocation();
}
```

## Monitoring and Analytics

### Performance Metrics

- AVS uptime and performance scores
- Cross-chain transaction success rates
- Bridge operation latency
- Validator performance trends

### Health Checks

- AVS service availability
- Bridge operation status
- Token metric freshness
- Validator performance degradation

## Future Enhancements

### Planned Features

- Support for additional AVS services (VITAL, SQUAD)
- Enhanced cross-chain position management
- Real-time yield optimization
- Advanced validator selection algorithms
- MEV protection integration

### Upgrade Path

- Modular AVS integration system
- Plugin architecture for new protocols
- Enhanced cross-chain capabilities
- Advanced analytics and reporting

## Network Configuration

### Production Deployment

```solidity
// Swellchain Mainnet Configuration
SwellChainIntegration integration = new SwellChainIntegration(
    MULTISIG_ADMIN,
    0x...SWETH_MAINNET_ADDRESS,
    address(0), // rswETH not yet deployed
    0x...STANDARD_BRIDGE_ADDRESS,
    0x...MACH_SERVICE_MANAGER,
    0x...NUCLEUS_BORING_VAULT,
    0x...NUCLEUS_MANAGER
);
```

### Development Setup

```solidity
// Swellchain Testnet Configuration
SwellChainIntegration integration = new SwellChainIntegration(
    DEV_ADMIN,
    0x...SWETH_TESTNET_ADDRESS,
    address(0),
    0x...TESTNET_BRIDGE_ADDRESS,
    0x...TESTNET_MACH_MANAGER,
    0x...TESTNET_NUCLEUS_VAULT,
    0x...TESTNET_NUCLEUS_MANAGER
);
``` 