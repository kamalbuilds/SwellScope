# WebSocket API Documentation

## Overview

SwellScope provides real-time data streaming through WebSocket connections for live monitoring of restaking positions, risk metrics, and market conditions. This API enables responsive user interfaces and automated trading systems.

## Connection Details

### Endpoint
- **Production**: `wss://api.swellscope.io/ws`
- **Testnet**: `wss://testnet-api.swellscope.io/ws`

### Authentication

WebSocket connections require authentication for user-specific data:

```javascript
const ws = new WebSocket('wss://api.swellscope.io/ws');

ws.onopen = () => {
  // Authenticate connection
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your-jwt-token'
  }));
};
```

### Connection Lifecycle

```javascript
const ws = new WebSocket('wss://api.swellscope.io/ws');

ws.onopen = (event) => {
  console.log('WebSocket connected');
  // Send authentication and subscriptions
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleMessage(data);
};

ws.onclose = (event) => {
  console.log('WebSocket disconnected:', event.code, event.reason);
  // Implement reconnection logic
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

## Message Format

All WebSocket messages follow a standard JSON format:

```typescript
interface WebSocketMessage {
  type: string;              // Message type identifier
  id?: string;               // Optional request ID for correlation
  timestamp: number;         // Unix timestamp
  data: any;                 // Message payload
  error?: {                  // Error information if applicable
    code: number;
    message: string;
  };
}
```

## Authentication

### Initial Authentication

```javascript
// Authentication message
{
  "type": "auth",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "timestamp": 1699123456789
}

// Authentication response
{
  "type": "auth_response",
  "data": {
    "status": "authenticated",
    "userId": "user_123",
    "permissions": ["read_portfolio", "read_market_data"]
  },
  "timestamp": 1699123456790
}
```

### Token Refresh

```javascript
// Refresh token
{
  "type": "refresh_token",
  "token": "new-jwt-token",
  "timestamp": 1699123456789
}
```

## Subscription Management

### Subscribe to Events

```javascript
// Subscribe to portfolio updates
{
  "type": "subscribe",
  "id": "sub_001",
  "channel": "portfolio",
  "params": {
    "address": "0x1234567890123456789012345678901234567890"
  }
}

// Subscription confirmation
{
  "type": "subscription_confirmed",
  "id": "sub_001",
  "channel": "portfolio",
  "data": {
    "subscriptionId": "portfolio_0x1234567890123456789012345678901234567890"
  },
  "timestamp": 1699123456791
}
```

### Unsubscribe from Events

```javascript
// Unsubscribe from channel
{
  "type": "unsubscribe",
  "id": "unsub_001",
  "subscriptionId": "portfolio_0x1234567890123456789012345678901234567890"
}

// Unsubscribe confirmation
{
  "type": "unsubscribe_confirmed",
  "id": "unsub_001",
  "data": {
    "subscriptionId": "portfolio_0x1234567890123456789012345678901234567890"
  },
  "timestamp": 1699123456792
}
```

## Available Channels

### Portfolio Updates

Real-time portfolio value and position changes:

```javascript
// Subscribe to portfolio
{
  "type": "subscribe",
  "channel": "portfolio",
  "params": {
    "address": "0x1234567890123456789012345678901234567890"
  }
}

// Portfolio update event
{
  "type": "portfolio_update",
  "data": {
    "address": "0x1234567890123456789012345678901234567890",
    "totalValue": "125000.50",
    "totalShares": "95230.125",
    "change24h": "2.35",
    "positions": [
      {
        "asset": "swETH",
        "amount": "45.25",
        "value": "112500.00",
        "allocation": "90.0",
        "apy": "4.2",
        "riskScore": 75
      }
    ],
    "riskMetrics": {
      "overallRisk": 78,
      "diversificationScore": 65,
      "liquidityScore": 85
    }
  },
  "timestamp": 1699123456793
}
```

### Risk Alerts

Critical risk threshold notifications:

```javascript
// Subscribe to risk alerts
{
  "type": "subscribe",
  "channel": "risk_alerts",
  "params": {
    "address": "0x1234567890123456789012345678901234567890",
    "thresholds": {
      "high_risk": 85,
      "slashing_risk": 70,
      "liquidity_risk": 30
    }
  }
}

// Risk alert event
{
  "type": "risk_alert",
  "data": {
    "alertType": "high_risk",
    "severity": "warning",
    "message": "Portfolio risk score exceeded threshold",
    "address": "0x1234567890123456789012345678901234567890",
    "currentRisk": 87,
    "threshold": 85,
    "affectedAssets": ["swETH"],
    "recommendations": [
      "Consider reducing exposure to high-risk strategies",
      "Diversify into lower-risk assets"
    ],
    "autoActions": {
      "rebalanceTriggered": true,
      "emergencyExitAvailable": false
    }
  },
  "timestamp": 1699123456794
}
```

### Market Data

Real-time market prices and yields:

```javascript
// Subscribe to market data
{
  "type": "subscribe",
  "channel": "market_data",
  "params": {
    "assets": ["swETH", "rswETH"],
    "metrics": ["price", "yield", "tvl"]
  }
}

// Market data update
{
  "type": "market_update",
  "data": {
    "asset": "swETH",
    "price": "2489.75",
    "priceChange24h": "1.25",
    "yield": "4.2",
    "yieldChange24h": "0.1",
    "tvl": "1500000000",
    "tvlChange24h": "2.5",
    "volume24h": "15000000",
    "marketCap": "3750000000"
  },
  "timestamp": 1699123456795
}
```

### Yield Tracking

Real-time yield rate changes:

```javascript
// Subscribe to yield updates
{
  "type": "subscribe",
  "channel": "yield_tracking",
  "params": {
    "protocols": ["swell", "mach_avs"],
    "assets": ["swETH"]
  }
}

// Yield update event
{
  "type": "yield_update",
  "data": {
    "protocol": "swell",
    "asset": "swETH",
    "currentYield": "4.25",
    "previousYield": "4.20",
    "change": "0.05",
    "changePercent": "1.19",
    "period": "24h",
    "factors": {
      "baseRate": "3.8",
      "rewards": "0.45",
      "fees": "-0.05"
    },
    "trend": "increasing",
    "volatility": "low"
  },
  "timestamp": 1699123456796
}
```

### AVS Performance

Actively Validated Services performance metrics:

```javascript
// Subscribe to AVS updates
{
  "type": "subscribe",
  "channel": "avs_performance",
  "params": {
    "services": ["mach", "vital", "squad"]
  }
}

// AVS performance update
{
  "type": "avs_update",
  "data": {
    "service": "mach",
    "performanceScore": 98.5,
    "uptime": "99.95",
    "slashingEvents": 0,
    "validatorCount": 1250,
    "stakedAmount": "2500000",
    "rewards24h": "125000",
    "commission": "10.0",
    "riskLevel": "low",
    "metrics": {
      "latency": "150ms",
      "throughput": "5000 tps",
      "finalityTime": "2.1s"
    }
  },
  "timestamp": 1699123456797
}
```

### Transaction Events

Real-time transaction confirmations:

```javascript
// Subscribe to transaction events
{
  "type": "subscribe",
  "channel": "transactions",
  "params": {
    "address": "0x1234567890123456789012345678901234567890",
    "types": ["deposit", "withdraw", "rebalance"]
  }
}

// Transaction event
{
  "type": "transaction_event",
  "data": {
    "hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "type": "deposit",
    "status": "confirmed",
    "blockNumber": 12345678,
    "from": "0x1234567890123456789012345678901234567890",
    "to": "0x9876543210987654321098765432109876543210",
    "amount": "10.5",
    "asset": "swETH",
    "gasUsed": "145230",
    "gasPrice": "20000000000",
    "fee": "0.0029046",
    "confirmations": 3,
    "receipt": {
      "logs": [...],
      "events": [...]
    }
  },
  "timestamp": 1699123456798
}
```

### Strategy Updates

Strategy performance and allocation changes:

```javascript
// Subscribe to strategy updates
{
  "type": "subscribe",
  "channel": "strategy_updates",
  "params": {
    "strategies": ["strategy_001", "strategy_002"]
  }
}

// Strategy update event
{
  "type": "strategy_update",
  "data": {
    "strategyId": "strategy_001",
    "name": "Conservative Restaking",
    "performance": {
      "apy": "4.15",
      "volatility": "2.3",
      "sharpeRatio": "1.8",
      "maxDrawdown": "1.2"
    },
    "allocation": "45.0",
    "riskScore": 72,
    "tvl": "50000000",
    "rebalancing": {
      "triggered": false,
      "nextRebalance": 1699209856798,
      "reason": null
    }
  },
  "timestamp": 1699123456799
}
```

### Network Status

Blockchain network health and performance:

```javascript
// Subscribe to network status
{
  "type": "subscribe",
  "channel": "network_status",
  "params": {
    "networks": ["swellchain", "ethereum"]
  }
}

// Network status update
{
  "type": "network_status",
  "data": {
    "network": "swellchain",
    "status": "healthy",
    "blockHeight": 12345678,
    "blockTime": "2.1s",
    "gasPrice": "0.1 gwei",
    "tps": "4500",
    "finalized": 12345675,
    "issues": [],
    "validators": {
      "active": 125,
      "total": 130,
      "participation": "96.15"
    }
  },
  "timestamp": 1699123456800
}
```

## Error Handling

### Error Message Format

```javascript
{
  "type": "error",
  "error": {
    "code": 4001,
    "message": "Unauthorized: Invalid token",
    "details": "JWT token has expired"
  },
  "timestamp": 1699123456801
}
```

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 4000 | Bad Request | Malformed message or invalid parameters |
| 4001 | Unauthorized | Authentication required or invalid token |
| 4003 | Forbidden | Insufficient permissions |
| 4004 | Not Found | Requested resource not found |
| 4009 | Conflict | Subscription already exists |
| 4029 | Too Many Requests | Rate limit exceeded |
| 5000 | Internal Error | Server-side error |
| 5001 | Service Unavailable | Service temporarily unavailable |

### Reconnection Strategy

```javascript
class SwellScopeWebSocket {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.subscriptions = new Map();
  }

  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('Connected to SwellScope WebSocket');
      this.reconnectAttempts = 0;
      this.authenticate();
      this.resubscribe();
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code);
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(JSON.parse(event.data));
    };
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  authenticate() {
    this.send({
      type: 'auth',
      token: this.token
    });
  }

  resubscribe() {
    for (const [id, subscription] of this.subscriptions) {
      this.send(subscription);
    }
  }

  subscribe(channel, params) {
    const subscription = {
      type: 'subscribe',
      id: `sub_${Date.now()}`,
      channel,
      params
    };
    
    this.subscriptions.set(subscription.id, subscription);
    this.send(subscription);
    return subscription.id;
  }

  unsubscribe(subscriptionId) {
    this.subscriptions.delete(subscriptionId);
    this.send({
      type: 'unsubscribe',
      subscriptionId
    });
  }

  send(message) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
    }
  }
}
```

## Rate Limiting

### Connection Limits
- **Max connections per IP**: 10
- **Max connections per user**: 5
- **Max subscriptions per connection**: 50

### Message Limits
- **Messages per second**: 100
- **Subscription requests per minute**: 60
- **Authentication attempts per minute**: 10

### Handling Rate Limits

```javascript
{
  "type": "error",
  "error": {
    "code": 4029,
    "message": "Rate limit exceeded",
    "details": "Too many subscription requests",
    "retryAfter": 30
  },
  "timestamp": 1699123456802
}
```

## Best Practices

### Connection Management

1. **Implement Exponential Backoff**: Use increasing delays for reconnection attempts
2. **Handle Authentication Expiry**: Refresh tokens before they expire
3. **Monitor Connection Health**: Implement ping/pong heartbeat
4. **Graceful Shutdown**: Properly close connections and clean up subscriptions

### Subscription Optimization

1. **Selective Subscriptions**: Only subscribe to needed data channels
2. **Parameter Filtering**: Use specific parameters to reduce unnecessary updates
3. **Batch Updates**: Group related subscriptions together
4. **Cleanup Unused Subscriptions**: Unsubscribe from channels no longer needed

### Data Processing

1. **Debounce Updates**: Avoid processing every rapid update
2. **Local Caching**: Cache recent data to reduce processing overhead
3. **Error Recovery**: Handle temporary data inconsistencies gracefully
4. **Validate Data**: Always validate incoming data structure

## SDK Integration

### JavaScript/TypeScript SDK

```typescript
import { SwellScopeWebSocket } from '@swellscope/websocket-sdk';

const client = new SwellScopeWebSocket({
  url: 'wss://api.swellscope.io/ws',
  token: 'your-jwt-token',
  autoReconnect: true,
  maxReconnectAttempts: 5
});

// Connect and authenticate
await client.connect();

// Subscribe to portfolio updates
const portfolioSub = await client.portfolio.subscribe({
  address: '0x1234567890123456789012345678901234567890'
});

portfolioSub.on('update', (data) => {
  console.log('Portfolio updated:', data);
});

// Subscribe to risk alerts
const riskSub = await client.risk.subscribe({
  address: '0x1234567890123456789012345678901234567890',
  thresholds: { high_risk: 85 }
});

riskSub.on('alert', (alert) => {
  console.log('Risk alert:', alert);
  if (alert.severity === 'critical') {
    // Handle critical risk alert
  }
});
```

### React Hooks

```typescript
import { useSwellScopeWebSocket, usePortfolioUpdates } from '@swellscope/react-sdk';

function PortfolioComponent({ address }) {
  const { connected, error } = useSwellScopeWebSocket();
  const { portfolio, loading } = usePortfolioUpdates(address);

  if (!connected) return <div>Connecting...</div>;
  if (error) return <div>Connection error: {error.message}</div>;
  if (loading) return <div>Loading portfolio...</div>;

  return (
    <div>
      <h2>Portfolio Value: ${portfolio.totalValue}</h2>
      <p>24h Change: {portfolio.change24h}%</p>
      {/* Render portfolio details */}
    </div>
  );
}
```

## Testing

### WebSocket Testing Tools

```javascript
// Test WebSocket connection
const testConnection = () => {
  const ws = new WebSocket('wss://testnet-api.swellscope.io/ws');
  
  ws.onopen = () => {
    console.log('Test connection successful');
    
    // Test authentication
    ws.send(JSON.stringify({
      type: 'auth',
      token: 'test-token'
    }));
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
    
    if (data.type === 'auth_response') {
      // Test subscription
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: 'market_data',
        params: { assets: ['swETH'] }
      }));
    }
  };
};
```

### Mock WebSocket Server

```javascript
// For development and testing
class MockSwellScopeWebSocket {
  constructor() {
    this.subscriptions = new Map();
    this.connected = false;
  }

  connect() {
    this.connected = true;
    setTimeout(() => {
      this.emit('auth_response', {
        status: 'authenticated',
        userId: 'test_user'
      });
    }, 100);
  }

  subscribe(channel, params) {
    const id = `mock_${Date.now()}`;
    this.subscriptions.set(id, { channel, params });
    
    // Simulate data updates
    setInterval(() => {
      this.emit(`${channel}_update`, this.generateMockData(channel));
    }, 1000);
    
    return id;
  }

  generateMockData(channel) {
    switch (channel) {
      case 'portfolio':
        return {
          totalValue: (Math.random() * 100000 + 50000).toFixed(2),
          change24h: (Math.random() * 10 - 5).toFixed(2)
        };
      case 'market_data':
        return {
          asset: 'swETH',
          price: (Math.random() * 100 + 2400).toFixed(2),
          yield: (Math.random() * 2 + 3).toFixed(2)
        };
      default:
        return {};
    }
  }
}
```

## Security Considerations

### Authentication Security
- **Token Validation**: Verify JWT tokens on every message
- **Permission Checks**: Ensure users can only access authorized data
- **Rate Limiting**: Prevent abuse with connection and message limits
- **IP Filtering**: Block suspicious IP addresses

### Data Protection
- **Encryption**: Use WSS (WebSocket Secure) for all connections
- **Data Sanitization**: Validate and sanitize all incoming data
- **Access Control**: Restrict sensitive data to authorized users
- **Audit Logging**: Log all connection and subscription activities

### Monitoring
- **Connection Monitoring**: Track active connections and patterns
- **Error Monitoring**: Monitor error rates and types
- **Performance Monitoring**: Track message latency and throughput
- **Security Monitoring**: Detect and respond to suspicious activity

---

For additional support or questions about the WebSocket API, contact our technical support team at ws-support@swellscope.io. 