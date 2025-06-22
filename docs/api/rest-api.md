# REST API Reference

SwellScope provides a comprehensive REST API for accessing analytics, managing portfolios, and integrating with external applications. The API follows RESTful principles and returns JSON responses.

## Base URL

```
Production: https://api.swellscope.io/v1
Staging: https://api-staging.swellscope.io/v1
Local: http://localhost:8000/v1
```

## Authentication

SwellScope API uses API keys for authentication. Include your API key in the request headers:

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Getting an API Key

1. Sign up at [SwellScope Dashboard](https://app.swellscope.io)
2. Navigate to Settings → API Keys
3. Generate a new API key with appropriate permissions

## Rate Limits

| Tier | Requests/minute | Requests/hour |
|------|----------------|---------------|
| Free | 60 | 1,000 |
| Pro | 600 | 10,000 |
| Enterprise | 6,000 | 100,000 |

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": {
      "field": "amount",
      "reason": "Must be greater than 0"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

## Analytics Endpoints

### Get Portfolio Overview

Get comprehensive portfolio analytics for a user.

```http
GET /analytics/portfolio/{address}
```

**Parameters:**
- `address` (string, required): Ethereum address
- `timeframe` (string, optional): `1h`, `24h`, `7d`, `30d`, `90d` (default: `24h`)

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x742d35Cc6635C0532925a3b8D4a6cC0e1b8e1",
    "totalValue": {
      "usd": 125000.50,
      "eth": 62.5
    },
    "positions": [
      {
        "protocol": "SwellScope Vault",
        "token": "swETH",
        "amount": "50.0",
        "value": {
          "usd": 100000.00,
          "eth": 50.0
        },
        "yield": {
          "apy": 8.5,
          "earned24h": {
            "usd": 23.29,
            "eth": 0.01164
          }
        }
      }
    ],
    "riskMetrics": {
      "overallRisk": 35,
      "riskLevel": "Medium",
      "components": {
        "slashingRisk": 15,
        "liquidityRisk": 25,
        "smartContractRisk": 20,
        "marketRisk": 40
      }
    },
    "performance": {
      "totalReturn": {
        "usd": 5250.75,
        "percentage": 4.38
      },
      "timeframe": "30d"
    }
  }
}
```

### Get Risk Assessment

Get detailed risk assessment for assets or portfolios.

```http
GET /analytics/risk/{asset}
```

**Parameters:**
- `asset` (string, required): Asset address or portfolio identifier
- `detailed` (boolean, optional): Include detailed risk breakdown

**Response:**
```json
{
  "success": true,
  "data": {
    "asset": "0xf951E335afb289353dc249e82926178EaC7DEd78",
    "symbol": "swETH",
    "riskScore": 35,
    "riskLevel": "Medium",
    "components": {
      "slashingRisk": {
        "score": 15,
        "description": "Low slashing probability",
        "factors": [
          "Validator performance: 98.5%",
          "Slashing history: 0 events",
          "Operator reputation: High"
        ]
      },
      "liquidityRisk": {
        "score": 25,
        "description": "Good liquidity availability",
        "factors": [
          "DEX liquidity: $50M",
          "Utilization rate: 75%",
          "Exit queue: 2 days"
        ]
      },
      "smartContractRisk": {
        "score": 20,
        "description": "Low technical risk",
        "factors": [
          "Audit status: Completed",
          "Bug bounty: Active",
          "Time since deployment: 8 months"
        ]
      },
      "marketRisk": {
        "score": 40,
        "description": "Moderate market volatility",
        "factors": [
          "30d volatility: 25%",
          "Correlation with ETH: 0.85",
          "Market cap: $2.5B"
        ]
      }
    },
    "recommendations": [
      "Consider diversifying across multiple validators",
      "Monitor liquidity conditions during high volatility",
      "Set stop-loss at 90% risk threshold"
    ]
  }
}
```

### Get Yield Analytics

Get yield performance and projections.

```http
GET /analytics/yield
```

**Query Parameters:**
- `protocols` (string, optional): Comma-separated protocol names
- `timeframe` (string, optional): Historical timeframe
- `projection` (boolean, optional): Include yield projections

**Response:**
```json
{
  "success": true,
  "data": {
    "protocols": [
      {
        "name": "SwellScope Vault",
        "currentApy": 8.5,
        "averageApy30d": 8.2,
        "tvl": {
          "usd": 45000000,
          "eth": 22500
        },
        "yieldSources": [
          {
            "source": "Ethereum Staking",
            "contribution": 4.2,
            "percentage": 49.4
          },
          {
            "source": "AVS Restaking",
            "contribution": 2.8,
            "percentage": 32.9
          },
          {
            "source": "DeFi Strategies",
            "contribution": 1.5,
            "percentage": 17.7
          }
        ]
      }
    ],
    "projections": {
      "7d": 8.6,
      "30d": 8.4,
      "90d": 8.8
    }
  }
}
```

## Portfolio Management

### Get User Strategies

List all strategies for a user.

```http
GET /portfolio/strategies
```

**Headers:**
- `X-User-Address` (string, required): User's Ethereum address

**Response:**
```json
{
  "success": true,
  "data": {
    "strategies": [
      {
        "id": "strategy_123",
        "name": "Conservative Restaking",
        "status": "active",
        "allocation": {
          "swETH": 60,
          "rswETH": 30,
          "cash": 10
        },
        "riskProfile": {
          "maxRisk": 75,
          "autoRebalance": true
        },
        "performance": {
          "totalReturn": 4.2,
          "timeframe": "30d"
        },
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Create Strategy

Create a new investment strategy.

```http
POST /portfolio/strategies
```

**Request Body:**
```json
{
  "name": "Aggressive Growth",
  "allocation": {
    "swETH": 40,
    "rswETH": 50,
    "nucleus": 10
  },
  "riskProfile": {
    "maxRisk": 85,
    "autoRebalance": true,
    "emergencyExitThreshold": 95
  },
  "rebalanceFrequency": "weekly"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "strategyId": "strategy_456",
    "status": "created",
    "estimatedGas": 120000,
    "transactionHash": null
  }
}
```

### Update Risk Profile

Update user's risk preferences.

```http
PUT /portfolio/risk-profile
```

**Request Body:**
```json
{
  "maxRiskScore": 80,
  "autoRebalance": true,
  "emergencyExitThreshold": 90,
  "notifications": {
    "riskAlerts": true,
    "rebalanceNotifications": true,
    "emergencyAlerts": true
  }
}
```

## Market Data

### Get Token Prices

Get current and historical token prices.

```http
GET /market/prices
```

**Query Parameters:**
- `tokens` (string, required): Comma-separated token symbols
- `currency` (string, optional): `usd`, `eth` (default: `usd`)
- `historical` (boolean, optional): Include price history

**Response:**
```json
{
  "success": true,
  "data": {
    "prices": {
      "swETH": {
        "current": 2000.50,
        "change24h": 2.5,
        "change7d": -1.2,
        "marketCap": 2500000000,
        "volume24h": 50000000
      },
      "rswETH": {
        "current": 2050.75,
        "change24h": 3.1,
        "change7d": 0.8,
        "marketCap": 1200000000,
        "volume24h": 25000000
      }
    },
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### Get Protocol TVL

Get Total Value Locked across protocols.

```http
GET /market/tvl
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTvl": {
      "usd": 125000000,
      "eth": 62500
    },
    "protocols": [
      {
        "name": "SwellScope",
        "tvl": {
          "usd": 45000000,
          "eth": 22500
        },
        "change24h": 5.2
      },
      {
        "name": "Nucleus",
        "tvl": {
          "usd": 80000000,
          "eth": 40000
        },
        "change24h": 2.8
      }
    ]
  }
}
```

## AVS Monitoring

### Get AVS Metrics

Get performance metrics for AVS services.

```http
GET /avs/metrics
```

**Query Parameters:**
- `services` (string, optional): Comma-separated AVS service names
- `timeframe` (string, optional): Metrics timeframe

**Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "name": "MACH",
        "status": "active",
        "performanceScore": 95,
        "metrics": {
          "finalityTime": 8.5,
          "uptime": 99.8,
          "slashingEvents": 0,
          "operatorCount": 125
        },
        "totalStaked": {
          "usd": 150000000,
          "eth": 75000
        }
      },
      {
        "name": "VITAL",
        "status": "not_deployed",
        "performanceScore": 0,
        "metrics": {
          "verificationRate": 0,
          "fraudProofs": 0,
          "uptime": 0
        }
      }
    ]
  }
}
```

## Transactions

### Get Transaction History

Get user's transaction history.

```http
GET /transactions/{address}
```

**Query Parameters:**
- `limit` (number, optional): Number of transactions (max 100)
- `offset` (number, optional): Pagination offset
- `type` (string, optional): Transaction type filter

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "hash": "0x123...",
        "type": "deposit",
        "protocol": "SwellScope Vault",
        "amount": {
          "token": "swETH",
          "value": "10.0",
          "usd": 20000.00
        },
        "timestamp": "2024-01-15T10:30:00Z",
        "status": "confirmed",
        "gasUsed": 120000,
        "gasPrice": "20000000000"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

## Webhooks

### Register Webhook

Register a webhook for real-time notifications.

```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/swellscope",
  "events": [
    "risk_alert",
    "rebalance_completed",
    "emergency_exit",
    "yield_update"
  ],
  "filters": {
    "address": "0x742d35Cc6635C0532925a3b8D4a6cC0e1b8e1",
    "minRiskScore": 80
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "webhookId": "webhook_789",
    "secret": "whsec_abc123...",
    "status": "active"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Request parameters are invalid |
| `UNAUTHORIZED` | Invalid or missing API key |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMITED` | Rate limit exceeded |
| `INTERNAL_ERROR` | Internal server error |
| `NETWORK_ERROR` | Blockchain network error |
| `INSUFFICIENT_BALANCE` | Insufficient token balance |
| `SLIPPAGE_EXCEEDED` | Transaction slippage too high |

## SDK Examples

### JavaScript/TypeScript

```typescript
import { SwellScopeAPI } from '@swellscope/sdk';

const api = new SwellScopeAPI({
  apiKey: 'your-api-key',
  environment: 'production' // or 'staging'
});

// Get portfolio overview
const portfolio = await api.analytics.getPortfolio(
  '0x742d35Cc6635C0532925a3b8D4a6cC0e1b8e1'
);

// Create new strategy
const strategy = await api.portfolio.createStrategy({
  name: 'Conservative Growth',
  allocation: { swETH: 70, rswETH: 30 },
  riskProfile: { maxRisk: 75, autoRebalance: true }
});
```

### Python

```python
from swellscope import SwellScopeAPI

api = SwellScopeAPI(
    api_key='your-api-key',
    environment='production'
)

# Get risk assessment
risk = api.analytics.get_risk_assessment(
    asset='0xf951E335afb289353dc249e82926178EaC7DEd78'
)

# Get yield analytics
yield_data = api.analytics.get_yield_analytics(
    protocols=['SwellScope Vault'],
    timeframe='30d'
)
```

## Testing

### Sandbox Environment

Use the sandbox environment for testing:

```
Base URL: https://api-sandbox.swellscope.io/v1
```

Sandbox features:
- No real transactions
- Simulated data responses
- Rate limits: 1000 requests/hour
- Free API access

### Postman Collection

Download our Postman collection for easy API testing:
[SwellScope API Collection](https://api.swellscope.io/postman/collection.json)

---

For more API documentation:
- [WebSocket API](websocket.md) - Real-time data streaming
- [GraphQL API](graphql.md) - Flexible data queries
- [SDK Documentation](sdk.md) - Client libraries 