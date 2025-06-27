# API Overview

SwellScope provides a comprehensive suite of APIs for accessing analytics, managing portfolios, and integrating with external applications. Our API design follows RESTful principles with real-time capabilities through WebSockets and flexible querying via GraphQL.

## API Architecture

### Available APIs

1. **REST API**: HTTP-based API for standard operations
2. **WebSocket API**: Real-time data streaming and live updates
3. **GraphQL API**: Flexible data querying with custom schemas
4. **SDK**: Type-safe client libraries for popular languages

### Base URLs

```
Production:  https://api.swellscope.io/v1
Staging:     https://api-staging.swellscope.io/v1
Local:       http://localhost:8000/v1
```

## Authentication

### API Key Authentication

SwellScope uses API keys for authentication. Include your API key in the Authorization header:

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Getting API Keys

1. Sign up at [SwellScope Dashboard](https://app.swellscope.io)
2. Navigate to Settings → API Keys
3. Generate a new API key with appropriate permissions
4. Configure rate limits and IP restrictions

### Authentication Scopes

```typescript
interface APIKeyPermissions {
  read: boolean;        // Read portfolio and analytics data
  write: boolean;       // Create and modify strategies
  trade: boolean;       // Execute trades and rebalancing
  admin: boolean;       // Administrative functions
}
```

## Rate Limiting

### Rate Limits by Tier

| Tier | Requests/minute | Requests/hour | WebSocket Connections |
|------|----------------|---------------|----------------------|
| Free | 60 | 1,000 | 1 |
| Pro | 600 | 10,000 | 5 |
| Enterprise | 6,000 | 100,000 | 50 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

## Core API Endpoints

### Analytics API

**Portfolio Analytics**
```http
GET /analytics/portfolio/{address}
GET /analytics/risk/{asset}
GET /analytics/yield?protocols=SwellScope,Nucleus
```

**Market Data**
```http
GET /market/prices?tokens=swETH,rswETH
GET /market/tvl
GET /market/apy-history?timeframe=30d
```

**Risk Assessment**
```http
GET /risk/score/{asset}
POST /risk/assessment
GET /risk/history/{address}?timeframe=7d
```

### Portfolio Management API

**Strategy Management**
```http
GET /portfolio/strategies
POST /portfolio/strategies
PUT /portfolio/strategies/{id}
DELETE /portfolio/strategies/{id}
```

**Position Management**
```http
GET /portfolio/positions/{address}
POST /portfolio/rebalance
GET /portfolio/performance/{address}
```

**Risk Profiles**
```http
GET /portfolio/risk-profile/{address}
PUT /portfolio/risk-profile
POST /portfolio/emergency-exit
```

### Cross-Chain API

**Bridge Operations**
```http
POST /bridge/initiate
GET /bridge/status/{operationId}
GET /bridge/history/{address}
```

**Multi-Chain Positions**
```http
GET /cross-chain/positions/{address}
GET /cross-chain/summary/{address}
POST /cross-chain/sync
```

### AVS Monitoring API

**Service Metrics**
```http
GET /avs/mach/metrics
GET /avs/vital/metrics
GET /avs/squad/metrics
GET /avs/all/status
```

**Performance Tracking**
```http
GET /avs/performance?service=MACH&timeframe=24h
GET /avs/alerts
POST /avs/subscribe
```

## Response Format

### Standard Response Structure

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "requestId": "req_123456789"
  }
}
```

### Error Response Format

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
    "version": "1.0.0",
    "requestId": "req_123456789"
  }
}
```

### Pagination

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Real-Time APIs

### WebSocket API

Connect to real-time data streams:

```javascript
const ws = new WebSocket('wss://api.swellscope.io/v1/ws');

ws.onopen = () => {
  // Subscribe to portfolio updates
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'portfolio',
    address: '0x742d35Cc6635C0532925a3b8D4a6cC0e1b8e1'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

### Available Channels

```typescript
interface WebSocketChannels {
  portfolio: {
    address: string;
    // Receives: portfolio value updates, position changes
  };
  
  risk: {
    address: string;
    threshold?: number;
    // Receives: risk score changes, alerts
  };
  
  market: {
    tokens: string[];
    // Receives: price updates, volume changes
  };
  
  avs: {
    services: string[];
    // Receives: performance metrics, status changes
  };
  
  bridge: {
    address: string;
    // Receives: bridge operation updates
  };
}
```

### GraphQL API

Access flexible data queries:

```graphql
query GetPortfolioOverview($address: String!) {
  portfolio(address: $address) {
    totalValue {
      usd
      eth
    }
    positions {
      protocol
      token
      amount
      value {
        usd
        eth
      }
      yield {
        apy
        earned24h {
          usd
          eth
        }
      }
    }
    riskMetrics {
      overallRisk
      riskLevel
      components {
        slashingRisk
        liquidityRisk
        smartContractRisk
        marketRisk
      }
    }
    performance {
      totalReturn {
        usd
        percentage
      }
      timeframe
    }
  }
}
```

## SDK Integration

### JavaScript/TypeScript SDK

```bash
npm install @swellscope/sdk
```

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

// Subscribe to real-time updates
api.realtime.subscribe('portfolio', {
  address: '0x742d35Cc6635C0532925a3b8D4a6cC0e1b8e1',
  onUpdate: (data) => {
    console.log('Portfolio updated:', data);
  }
});
```

### Python SDK

```bash
pip install swellscope-python
```

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

# Real-time monitoring
def on_portfolio_update(data):
    print(f"Portfolio update: {data}")

api.realtime.subscribe_portfolio(
    address='0x742d35Cc6635C0532925a3b8D4a6cC0e1b8e1',
    callback=on_portfolio_update
)
```

## Error Codes

### Standard Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_REQUEST` | Request parameters are invalid | 400 |
| `UNAUTHORIZED` | Invalid or missing API key | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `RATE_LIMITED` | Rate limit exceeded | 429 |
| `INTERNAL_ERROR` | Internal server error | 500 |
| `NETWORK_ERROR` | Blockchain network error | 503 |

### Domain-Specific Error Codes

| Code | Description |
|------|-------------|
| `INSUFFICIENT_BALANCE` | Insufficient token balance |
| `SLIPPAGE_EXCEEDED` | Transaction slippage too high |
| `RISK_THRESHOLD_EXCEEDED` | Portfolio risk above threshold |
| `STRATEGY_NOT_FOUND` | Strategy does not exist |
| `BRIDGE_OPERATION_FAILED` | Cross-chain operation failed |
| `VALIDATOR_OFFLINE` | Validator is offline |
| `ORACLE_STALE` | Price oracle data is stale |

## API Examples

### Complete Portfolio Analysis

```typescript
// Comprehensive portfolio analysis example
async function analyzePortfolio(address: string) {
  const api = new SwellScopeAPI({ apiKey: 'your-key' });
  
  // Get current portfolio state
  const portfolio = await api.analytics.getPortfolio(address);
  
  // Assess risk levels
  const riskAssessment = await api.analytics.getRiskAssessment(address);
  
  // Get performance metrics
  const performance = await api.analytics.getPerformance(address, '30d');
  
  // Check cross-chain positions
  const crossChainPositions = await api.crossChain.getPositions(address);
  
  // Generate recommendations
  const recommendations = await api.analytics.getRecommendations(address);
  
  return {
    portfolio,
    riskAssessment,
    performance,
    crossChainPositions,
    recommendations
  };
}
```

### Automated Risk Management

```typescript
// Set up automated risk monitoring
async function setupRiskMonitoring(address: string) {
  const api = new SwellScopeAPI({ apiKey: 'your-key' });
  
  // Configure risk profile
  await api.portfolio.updateRiskProfile({
    maxRiskScore: 75,
    autoRebalance: true,
    emergencyExitThreshold: 90,
    notifications: {
      riskAlerts: true,
      rebalanceNotifications: true,
      emergencyAlerts: true
    }
  });
  
  // Subscribe to risk alerts
  api.realtime.subscribe('risk', {
    address,
    threshold: 70,
    onUpdate: async (data) => {
      if (data.riskScore > 80) {
        console.log('High risk detected, considering rebalance');
        
        // Trigger rebalancing
        const rebalanceResult = await api.portfolio.rebalance(address, {
          targetRisk: 60,
          strategy: 'conservative'
        });
        
        console.log('Rebalance initiated:', rebalanceResult);
      }
    }
  });
}
```

### Bridge Operation Monitoring

```typescript
// Monitor cross-chain bridge operations
async function monitorBridgeOperations(address: string) {
  const api = new SwellScopeAPI({ apiKey: 'your-key' });
  
  // Get pending bridge operations
  const pendingOps = await api.bridge.getHistory(address, {
    status: 'pending'
  });
  
  // Monitor each operation
  for (const operation of pendingOps) {
    api.realtime.subscribe('bridge', {
      operationId: operation.id,
      onUpdate: (data) => {
        console.log(`Bridge operation ${data.id} status: ${data.status}`);
        
        if (data.status === 'completed') {
          console.log('Bridge operation completed successfully');
        } else if (data.status === 'failed') {
          console.error('Bridge operation failed:', data.error);
        }
      }
    });
  }
}
```

## Testing and Development

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

### OpenAPI Specification

Access our complete OpenAPI specification:
[SwellScope OpenAPI Spec](https://api.swellscope.io/openapi.json)

## Support and Resources

### Documentation Links

- [REST API Reference](rest-api.md) - Complete HTTP API documentation
- [WebSocket API](websocket.md) - Real-time data streaming
- [GraphQL API](graphql.md) - Flexible data queries
- [SDK Documentation](sdk.md) - Client libraries and examples
- [Authentication Guide](auth.md) - Authentication and security

### Community and Support

- **Documentation**: [docs.swellscope.io](https://docs.swellscope.io)
- **Discord Community**: [discord.gg/swellscope](https://discord.gg/swellscope)
- **GitHub**: [github.com/kamalbuilds/swell-scope](https://github.com/kamalbuilds/swell-scope)
- **Support Email**: api-support@swellscope.io
- **Status Page**: [status.swellscope.io](https://status.swellscope.io)

---

The SwellScope API provides comprehensive access to restaking analytics and portfolio management capabilities. Start with our Quick Start guide and explore the detailed documentation for each API type. 