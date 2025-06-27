# RiskOracle Contract

## Overview

The `RiskOracle` is a production-ready risk assessment oracle for Swellchain restaking protocols that provides real-time risk metrics for assets, validators, and protocols. It serves as the central risk intelligence system for the SwellScope platform, offering comprehensive risk scoring and monitoring capabilities.

## Contract Architecture

### Core Functionality

- **Real-time Risk Assessment**: Continuous monitoring and calculation of risk metrics
- **Multi-dimensional Risk Analysis**: Asset, validator, and protocol risk evaluation
- **Emergency Alert System**: Automated alerts for high-risk conditions
- **Configurable Risk Models**: Adjustable weights and thresholds
- **Oracle Network Integration**: Support for multiple data sources
- **Circuit Breaker Mechanisms**: Automatic risk mitigation triggers

### Inheritance Structure

```solidity
RiskOracle is IRiskOracle, AccessControl, ReentrancyGuard, Pausable
```

## Role-Based Access Control

### Roles

| Role | Purpose | Permissions |
|------|---------|-------------|
| `DEFAULT_ADMIN_ROLE` | Contract administration | Role management, configuration |
| `ORACLE_ROLE` | Data provision | Update risk scores and metrics |
| `RISK_MANAGER_ROLE` | Risk operations | Threshold management, model updates |
| `EMERGENCY_ROLE` | Emergency response | Emergency alerts, system suspension |

### Role Implementation

```solidity
bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
bytes32 public constant RISK_MANAGER_ROLE = keccak256("RISK_MANAGER_ROLE");
```

## Data Structures

### RiskMetrics

```solidity
struct RiskMetrics {
    uint256 compositeRisk;        // Overall risk score (0-10000 basis points)
    uint256 slashingRisk;         // Validator slashing risk
    uint256 liquidityRisk;        // Asset liquidity risk
    uint256 smartContractRisk;    // Protocol smart contract risk
    uint256 marketRisk;           // Market volatility risk
    uint256 lastUpdate;           // Last update timestamp
    bool isValid;                 // Data validity flag
}
```

### ValidatorMetrics

```solidity
struct ValidatorMetrics {
    uint256 performanceScore;     // Performance score (0-10000)
    uint256 uptime;               // Uptime percentage (0-10000)
    uint256 slashingHistory;      // Number of slashing events
    uint256 totalStaked;          // Total staked amount
    bool isActive;                // Validator active status
    uint256 lastUpdate;           // Last metrics update
}
```

### ProtocolMetrics

```solidity
struct ProtocolMetrics {
    uint256 tvl;                  // Total Value Locked
    uint256 utilization;          // Utilization rate (0-10000)
    uint256 liquidityRatio;       // Liquidity ratio (0-10000)
    uint256 securityScore;        // Security assessment score
    uint256 auditScore;           // Audit score (0-10000)
    uint256 riskScore;            // Protocol risk score
}
```

## Core Functions

### Constructor

```solidity
constructor(address admin, address oracle)
```

Initializes the RiskOracle with administrative and oracle roles.

**Parameters:**
- `admin`: Address with administrative privileges
- `oracle`: Address with oracle data provision privileges

### Risk Score Retrieval

#### getRiskScore

```solidity
function getRiskScore(address asset) external view override returns (uint256)
```

Returns the current composite risk score for an asset.

**Returns:** Risk score in basis points (0-10000)

#### getRiskMetrics

```solidity
function getRiskMetrics(address asset) external view override returns (RiskMetrics memory)
```

Returns comprehensive risk metrics for an asset.

#### getValidatorMetrics

```solidity
function getValidatorMetrics(address validator) external view override returns (ValidatorMetrics memory)
```

Returns validator performance and risk metrics.

#### getProtocolMetrics

```solidity
function getProtocolMetrics(address protocol) external view override returns (ProtocolMetrics memory)
```

Returns protocol-specific risk metrics.

### Risk Calculation

#### calculateCompositeRisk

```solidity
function calculateCompositeRisk(address asset) external view override returns (uint256)
```

Calculates the composite risk score using weighted average of risk components.

**Formula:**
```
compositeRisk = (
    slashingRisk * slashingWeight +
    liquidityRisk * liquidityWeight +
    smartContractRisk * smartContractWeight +
    marketRisk * marketWeight
) / 10000
```

#### calculateSlashingRisk

```solidity
function calculateSlashingRisk(address validator) external view override returns (uint256)
```

Calculates slashing risk based on validator performance and history.

**Risk Factors:**
- Historical slashing events
- Performance score
- Uptime percentage
- Validator status

#### calculateLiquidityRisk

```solidity
function calculateLiquidityRisk(address asset) external view override returns (uint256)
```

Assesses liquidity risk based on utilization and liquidity ratios.

**Risk Factors:**
- Protocol utilization rate
- Available liquidity
- Market depth
- Exit queue length

#### calculateSmartContractRisk

```solidity
function calculateSmartContractRisk(address protocol) external view override returns (uint256)
```

Evaluates smart contract risk based on security assessments.

**Risk Factors:**
- Security audit scores
- Code coverage
- Formal verification status
- Bug bounty programs

### Data Updates

#### updateRiskScore

```solidity
function updateRiskScore(address asset, uint256 newScore) external override onlyOracle whenNotPaused
```

Updates the risk score for an asset (oracle only).

**Parameters:**
- `asset`: Asset address
- `newScore`: New risk score (0-10000 basis points)

**Effects:**
- Updates asset risk metrics
- Triggers emergency alerts if threshold exceeded
- Emits `RiskScoreUpdated` event

#### updateValidatorMetrics

```solidity
function updateValidatorMetrics(
    address validator, 
    ValidatorMetrics calldata metrics
) external override onlyOracle whenNotPaused
```

Updates validator performance metrics.

#### updateProtocolMetrics

```solidity
function updateProtocolMetrics(
    address protocol,
    ProtocolMetrics calldata metrics
) external override onlyOracle whenNotPaused
```

Updates protocol risk metrics.

## Configuration Parameters

### Risk Scoring Constants

```solidity
uint256 public constant MAX_RISK_SCORE = 10000; // 100.00% in basis points
uint256 public constant EMERGENCY_THRESHOLD = 9000; // 90.00% 
uint256 public constant STALENESS_THRESHOLD = 1 hours;
```

### Risk Component Weights

```solidity
uint256 public slashingWeight = 3000; // 30%
uint256 public liquidityWeight = 2500; // 25%
uint256 public smartContractWeight = 2500; // 25%
uint256 public marketWeight = 2000; // 20%
```

## Risk Assessment Algorithms

### Composite Risk Calculation

The oracle uses a weighted average approach to calculate composite risk:

1. **Slashing Risk (30%)**: Based on validator performance and slashing history
2. **Liquidity Risk (25%)**: Based on asset liquidity and utilization
3. **Smart Contract Risk (25%)**: Based on protocol security assessments
4. **Market Risk (20%)**: Based on volatility and market conditions

### Dynamic Risk Adjustments

Risk scores are dynamically adjusted based on:

- Real-time market conditions
- Validator performance changes
- Protocol upgrades and audits
- Liquidity pool utilization
- Emergency conditions

### Emergency Thresholds

Automatic triggers for high-risk conditions:

- **90% Risk Score**: Emergency alert triggered
- **95% Risk Score**: Automatic position reduction recommended
- **98% Risk Score**: Emergency exit suggested

## Events

### Risk Update Events

```solidity
event RiskScoreUpdated(address indexed asset, uint256 oldScore, uint256 newScore);
event ValidatorScoreUpdated(address indexed validator, uint256 riskScore);
event ProtocolScoreUpdated(address indexed protocol, uint256 riskScore);
```

### Emergency Events

```solidity
event EmergencyAlert(address indexed asset, uint256 riskScore, string reason);
event RiskThresholdBreached(address indexed asset, uint256 threshold, uint256 currentScore);
```

### Configuration Events

```solidity
event RiskWeightsUpdated(uint256 slashing, uint256 liquidity, uint256 smartContract, uint256 market);
event EmergencyThresholdUpdated(uint256 newThreshold);
```

## Usage Examples

### Basic Risk Assessment

```solidity
// Get risk score for an asset
uint256 riskScore = riskOracle.getRiskScore(assetAddress);

// Get detailed risk metrics
RiskMetrics memory metrics = riskOracle.getRiskMetrics(assetAddress);

// Calculate composite risk
uint256 compositeRisk = riskOracle.calculateCompositeRisk(assetAddress);
```

### Validator Risk Monitoring

```solidity
// Get validator metrics
ValidatorMetrics memory validatorData = riskOracle.getValidatorMetrics(validatorAddress);

// Calculate slashing risk
uint256 slashingRisk = riskOracle.calculateSlashingRisk(validatorAddress);

// Check if validator is safe
require(slashingRisk < SAFE_VALIDATOR_THRESHOLD, "Validator risk too high");
```

### Oracle Data Updates

```solidity
// Update risk score (oracle role required)
riskOracle.updateRiskScore(assetAddress, newRiskScore);

// Update validator metrics
ValidatorMetrics memory metrics = ValidatorMetrics({
    performanceScore: 9500,
    uptime: 9800,
    slashingHistory: 0,
    totalStaked: 1000 ether,
    isActive: true,
    lastUpdate: block.timestamp
});
riskOracle.updateValidatorMetrics(validatorAddress, metrics);
```

## Integration with SwellScope

### Risk-Based Position Management

```solidity
// Automatic position sizing based on risk
uint256 riskScore = riskOracle.getRiskScore(asset);
uint256 maxPosition = calculateMaxPosition(riskScore);

// Emergency exit triggers
if (riskScore >= EMERGENCY_THRESHOLD) {
    vault.triggerEmergencyExit();
}
```

### Dynamic Fee Adjustment

```solidity
// Adjust fees based on risk
uint256 riskScore = riskOracle.getRiskScore(asset);
uint256 riskAdjustedFee = baseFee + (riskScore * riskMultiplier / 10000);
```

## Data Sources

### On-Chain Data

- Validator performance metrics from Swellchain
- Protocol TVL and utilization rates
- Slashing events and penalties
- Token price feeds and volatility

### Off-Chain Integrations

- Audit report scores
- Security assessment results
- Market sentiment indicators
- Macroeconomic risk factors

## Security Considerations

### Data Integrity

- Multi-oracle validation for critical updates
- Cryptographic signatures for off-chain data
- Sanity checks for all risk score updates
- Time-weighted average smoothing

### Access Controls

- Role-based permissions for all functions
- Multi-signature requirements for critical updates
- Emergency pause mechanisms
- Upgrade timelock delays

### Circuit Breakers

- Automatic pause on extreme risk scores
- Rate limiting for rapid score changes
- Minimum update intervals
- Maximum score deviation limits

## Monitoring and Alerting

### Real-time Monitoring

- Continuous risk score tracking
- Threshold breach detection
- Anomaly detection algorithms
- Performance degradation alerts

### Alert System

- Immediate notifications for emergency conditions
- Escalation procedures for high-risk assets
- Integration with external monitoring systems
- Dashboard integration for risk visualization

## Deployment Configuration

### Constructor Parameters

```solidity
// Deploy RiskOracle
RiskOracle oracle = new RiskOracle(
    ADMIN_ADDRESS,    // Admin role
    ORACLE_ADDRESS    // Oracle data provider
);
```

### Initial Setup

1. Deploy contract with proper admin and oracle addresses
2. Configure risk component weights
3. Set emergency thresholds
4. Initialize supported assets and validators
5. Establish data feed connections
6. Configure monitoring and alerting

## Performance Optimization

### Gas Efficiency

- Optimized storage patterns
- Batch update capabilities
- Minimal external calls
- Efficient risk calculation algorithms

### Scalability

- Support for multiple asset types
- Configurable update frequencies
- Off-chain computation with on-chain verification
- Horizontal oracle scaling

## Future Enhancements

### Planned Features

- Machine learning risk models
- Cross-chain risk aggregation
- Predictive risk indicators
- Advanced correlation analysis
- Governance-driven parameter updates

### Upgrade Path

- Modular risk model architecture
- Plugin system for new risk factors
- Oracle network expansion
- Enhanced data source integration 