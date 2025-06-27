# REST API Documentation

## Overview

The SwellScope REST API provides comprehensive access to restaking analytics, risk management, and portfolio data. Built with production-grade reliability and security, the API enables programmatic access to all platform features.

## Base URL

```
Production: https://api.swellscope.io/v1
Testnet: https://api-testnet.swellscope.io/v1
```

## Authentication

### API Key Authentication

All API requests require authentication using API keys:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.swellscope.io/v1/portfolio
```

### Obtaining API Keys

1. Log in to your SwellScope dashboard
2. Navigate to Settings > API Keys
3. Generate a new API key with appropriate permissions
4. Store the key securely - it won't be shown again

### Rate Limiting

- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **Premium users**: 5000 requests per minute

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Portfolio Endpoints

### Get Portfolio Summary

```http
GET /portfolio
```

Returns comprehensive portfolio information for the authenticated user.

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D8AB0C1FD3D4d2bF",
  "totalValue": "125.45",
  "totalYield": "8.7",
  "riskScore": 65,
  "positions": [
    {
      "asset": "swETH",
      "amount": "100.0",
      "value": "125.45",
      "chain": "swellchain",
      "strategy": "conservative",
      "apy": "8.7"
    }
  ],
  "performance": {
    "day": "0.15",
    "week": "1.2",
    "month": "8.7",
    "year": "15.3"
  },
  "lastUpdate": "2024-01-15T10:30:00Z"
}
```

### Get Portfolio History

```http
GET /portfolio/history?period=7d&interval=1h
```

**Parameters:**
- `period`: Time period (1d, 7d, 30d, 90d, 1y)
- `interval`: Data interval (1m, 5m, 15m, 1h, 1d)

**Response:**
```json
{
  "period": "7d",
  "interval": "1h",
  "data": [
    {
      "timestamp": "2024-01-15T10:00:00Z",
      "totalValue": "125.45",
      "yield": "8.7",
      "riskScore": 65
    }
  ]
}
```

### Update Risk Profile

```http
PUT /portfolio/risk-profile
```

**Request Body:**
```json
{
  "maxRiskScore": 75,
  "autoRebalance": true,
  "yieldTarget": 10.0,
  "riskTolerance": "moderate"
}
```

**Response:**
```json
{
  "success": true,
  "riskProfile": {
    "maxRiskScore": 75,
    "autoRebalance": true,
    "yieldTarget": 10.0,
    "riskTolerance": "moderate",
    "lastUpdate": "2024-01-15T10:30:00Z"
  }
}
```

## Risk Management Endpoints

### Get Risk Assessment

```http
GET /risk/assessment/{address}
```

Returns comprehensive risk analysis for a specific address or asset.

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D8AB0C1FD3D4d2bF",
  "overallRisk": 65,
  "riskFactors": {
    "slashingRisk": 45,
    "liquidityRisk": 60,
    "smartContractRisk": 25,
    "marketRisk": 70
  },
  "alerts": [
    {
      "type": "warning",
      "message": "High market volatility detected",
      "severity": "medium",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "recommendations": [
    {
      "action": "reduce_exposure",
      "reason": "High market risk",
      "impact": "Lower portfolio volatility",
      "urgency": "medium"
    }
  ]
}
```

### Get Validator Risk Metrics

```http
GET /risk/validator/{validatorAddress}
```

**Response:**
```json
{
  "validatorAddress": "0x...",
  "performanceScore": 95,
  "slashingRisk": 15,
  "uptime": 99.8,
  "totalStaked": "1000.0",
  "slashingHistory": [],
  "riskFactors": {
    "performance": 5,
    "slashing": 15,
    "uptime": 2,
    "concentration": 10
  },
  "recommendation": "low_risk"
}
```

### Get AVS Risk Analysis

```http
GET /risk/avs/{avsAddress}
```

**Response:**
```json
{
  "avsAddress": "0x...",
  "avsName": "MACH",
  "overallRisk": 35,
  "performanceScore": 92,
  "slashingEvents": 0,
  "operatorCount": 50,
  "totalStaked": "10000.0",
  "metrics": {
    "uptime": 99.9,
    "latency": 250,
    "successRate": 99.95
  },
  "riskAssessment": "low"
}
```

## Analytics Endpoints

### Get Yield Analytics

```http
GET /analytics/yield?asset=swETH&period=30d
```

**Parameters:**
- `asset`: Asset symbol (swETH, rswETH, ETH)
- `period`: Analysis period (7d, 30d, 90d, 1y)

**Response:**
```json
{
  "asset": "swETH",
  "period": "30d",
  "currentYield": 8.7,
  "averageYield": 8.2,
  "yieldHistory": [
    {
      "date": "2024-01-15",
      "yield": 8.7,
      "volume": "1000000"
    }
  ],
  "projections": {
    "nextWeek": 8.9,
    "nextMonth": 9.1,
    "confidence": 0.75
  }
}
```

### Get Performance Benchmarks

```http
GET /analytics/benchmarks
```

**Response:**
```json
{
  "benchmarks": {
    "ethStaking": 4.2,
    "swellStaking": 8.7,
    "defiAverage": 6.5,
    "restakingAverage": 9.8
  },
  "relativePerfomance": {
    "vsEthStaking": "+107%",
    "vsDefi": "+34%",
    "vsRestaking": "-11%"
  },
  "lastUpdate": "2024-01-15T10:30:00Z"
}
```

### Get Market Intelligence

```http
GET /analytics/market-intelligence
```

**Response:**
```json
{
  "restakingMarket": {
    "totalTvl": "2500000000",
    "growth24h": "2.5%",
    "averageYield": 9.8,
    "activeValidators": 15000
  },
  "swellchainMetrics": {
    "chainTvl": "500000000",
    "averageBlockTime": 2.1,
    "transactionThroughput": 2000,
    "machUptime": 99.9
  },
  "opportunities": [
    {
      "type": "yield_farming",
      "protocol": "Ambient",
      "estimatedApy": 12.5,
      "riskScore": 70,
      "liquidity": "high"
    }
  ]
}
```

## Cross-Chain Endpoints

### Get Cross-Chain Positions

```http
GET /cross-chain/positions
```

**Response:**
```json
{
  "positions": [
    {
      "chainId": 1,
      "chainName": "Ethereum",
      "assets": [
        {
          "symbol": "swETH",
          "balance": "50.0",
          "value": "62.75",
          "yield": "4.2"
        }
      ]
    },
    {
      "chainId": 1923,
      "chainName": "Swellchain",
      "assets": [
        {
          "symbol": "swETH",
          "balance": "50.0",
          "value": "62.70",
          "yield": "8.7"
        }
      ]
    }
  ],
  "totalValue": "125.45",
  "totalYield": "6.45"
}
```

### Initiate Bridge Transfer

```http
POST /cross-chain/bridge
```

**Request Body:**
```json
{
  "fromChain": 1,
  "toChain": 1923,
  "asset": "swETH",
  "amount": "10.0",
  "recipient": "0x742d35Cc6634C0532925a3b8D8AB0C1FD3D4d2bF"
}
```

**Response:**
```json
{
  "bridgeId": "bridge_123456789",
  "status": "initiated",
  "estimatedTime": "15 minutes",
  "fees": {
    "bridgeFee": "0.001",
    "gasFee": "0.005"
  },
  "transactionHash": "0x..."
}
```

### Get Bridge Status

```http
GET /cross-chain/bridge/{bridgeId}
```

**Response:**
```json
{
  "bridgeId": "bridge_123456789",
  "status": "completed",
  "fromChain": 1,
  "toChain": 1923,
  "asset": "swETH",
  "amount": "10.0",
  "actualTime": "12 minutes",
  "transactionHashes": {
    "deposit": "0x...",
    "withdrawal": "0x..."
  },
  "completedAt": "2024-01-15T10:42:00Z"
}
```

## Strategy Endpoints

### Get Available Strategies

```http
GET /strategies
```

**Response:**
```json
{
  "strategies": [
    {
      "id": "conservative_sweth",
      "name": "Conservative swETH",
      "description": "Low-risk swETH staking with minimal exposure to restaking",
      "riskScore": 25,
      "expectedYield": 6.5,
      "minimumDeposit": "1.0",
      "assets": ["swETH"],
      "features": ["auto_rebalancing", "emergency_exit"]
    },
    {
      "id": "aggressive_restaking",
      "name": "Aggressive Restaking",
      "description": "High-yield restaking across multiple AVS services",
      "riskScore": 80,
      "expectedYield": 15.2,
      "minimumDeposit": "5.0",
      "assets": ["swETH", "rswETH"],
      "features": ["yield_optimization", "risk_management"]
    }
  ]
}
```

### Deploy Strategy

```http
POST /strategies/{strategyId}/deploy
```

**Request Body:**
```json
{
  "amount": "100.0",
  "riskParameters": {
    "maxRiskScore": 75,
    "autoRebalance": true,
    "emergencyExit": true
  },
  "customSettings": {
    "rebalanceThreshold": 0.05,
    "yieldTarget": 10.0
  }
}
```

**Response:**
```json
{
  "deploymentId": "deploy_123456789",
  "status": "deploying",
  "estimatedTime": "5 minutes",
  "transactionHash": "0x...",
  "strategyAddress": "0x..."
}
```

## AVS Monitoring Endpoints

### Get AVS Performance

```http
GET /avs/performance
```

**Response:**
```json
{
  "avsServices": [
    {
      "name": "MACH",
      "address": "0x...",
      "performanceScore": 95,
      "uptime": 99.9,
      "slashingEvents": 0,
      "totalStaked": "10000.0",
      "operatorCount": 50,
      "yield": 12.5,
      "status": "active"
    },
    {
      "name": "VITAL",
      "address": "0x...",
      "performanceScore": 0,
      "uptime": 0,
      "status": "not_deployed"
    }
  ],
  "summary": {
    "totalAvs": 3,
    "activeAvs": 1,
    "averagePerformance": 95,
    "totalStaked": "10000.0"
  }
}
```

### Get MACH Specific Metrics

```http
GET /avs/mach/metrics
```

**Response:**
```json
{
  "service": "MACH",
  "performance": {
    "uptime": 99.9,
    "avgBlockTime": 2.1,
    "finalityTime": 0.8,
    "tps": 2000
  },
  "staking": {
    "totalStaked": "10000.0",
    "operatorCount": 50,
    "averageStake": "200.0",
    "yield": 12.5
  },
  "security": {
    "slashingEvents": 0,
    "riskScore": 15,
    "validatorCount": 50
  },
  "lastUpdate": "2024-01-15T10:30:00Z"
}
```

## Alerts and Notifications

### Get Active Alerts

```http
GET /alerts
```

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert_123",
      "type": "risk_warning",
      "severity": "medium",
      "message": "Portfolio risk score exceeded 75%",
      "details": {
        "currentRisk": 78,
        "threshold": 75,
        "affectedAssets": ["swETH"]
      },
      "timestamp": "2024-01-15T10:30:00Z",
      "acknowledged": false
    }
  ],
  "summary": {
    "total": 5,
    "critical": 0,
    "warning": 3,
    "info": 2
  }
}
```

### Create Alert Rule

```http
POST /alerts/rules
```

**Request Body:**
```json
{
  "name": "High Risk Alert",
  "condition": {
    "metric": "portfolio_risk",
    "operator": "greater_than",
    "threshold": 80
  },
  "notifications": ["email", "webhook"],
  "enabled": true
}
```

### Acknowledge Alert

```http
PUT /alerts/{alertId}/acknowledge
```

**Response:**
```json
{
  "success": true,
  "alertId": "alert_123",
  "acknowledgedAt": "2024-01-15T10:45:00Z"
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The specified asset is not supported",
    "details": {
      "parameter": "asset",
      "value": "INVALID_TOKEN",
      "supported": ["swETH", "rswETH", "ETH"]
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

## SDK and Libraries

### JavaScript/TypeScript SDK

```bash
npm install @swellscope/sdk
```

```typescript
import { SwellScopeSDK } from '@swellscope/sdk';

const sdk = new SwellScopeSDK({
  apiKey: 'your-api-key',
  environment: 'production' // or 'testnet'
});

// Get portfolio
const portfolio = await sdk.portfolio.get();

// Get risk assessment
const risk = await sdk.risk.assess(address);

// Monitor AVS performance
const machMetrics = await sdk.avs.getMachMetrics();
```

### Python SDK

```bash
pip install swellscope-python
```

```python
from swellscope import SwellScopeClient

client = SwellScopeClient(
    api_key='your-api-key',
    environment='production'
)

# Get portfolio
portfolio = client.portfolio.get()

# Get risk assessment
risk = client.risk.assess(address)

# Monitor AVS performance
mach_metrics = client.avs.get_mach_metrics()
```

## Webhooks

### Webhook Configuration

Configure webhooks in your dashboard to receive real-time notifications:

```json
{
  "url": "https://your-app.com/webhooks/swellscope",
  "events": [
    "portfolio.updated",
    "risk.alert",
    "strategy.rebalanced",
    "bridge.completed"
  ],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload

```json
{
  "event": "risk.alert",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "address": "0x742d35Cc6634C0532925a3b8D8AB0C1FD3D4d2bF",
    "riskScore": 85,
    "threshold": 80,
    "alert": {
      "type": "risk_threshold_exceeded",
      "severity": "high",
      "message": "Portfolio risk score exceeded threshold"
    }
  }
}
```

This comprehensive REST API enables full programmatic access to SwellScope's restaking analytics and risk management capabilities. 