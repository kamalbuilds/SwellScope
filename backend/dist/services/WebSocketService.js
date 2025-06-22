"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const logger_1 = require("../utils/logger");
class WebSocketService {
    io;
    connectedClients = new Map();
    constructor(io) {
        this.io = io;
        this.setupSocketHandlers();
    }
    /**
     * Setup socket event handlers
     */
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            const clientId = socket.id;
            // Store client info
            this.connectedClients.set(clientId, {
                socketId: clientId,
                subscriptions: new Set(),
                connectedAt: Date.now()
            });
            logger_1.logger.info(`WebSocket client connected: ${clientId}`);
            // Handle client subscription
            socket.on('subscribe', (data) => {
                this.handleSubscription(clientId, data);
            });
            // Handle client unsubscription
            socket.on('unsubscribe', (data) => {
                this.handleUnsubscription(clientId, data);
            });
            // Handle client authentication
            socket.on('authenticate', (data) => {
                this.handleAuthentication(clientId, data);
            });
            // Handle client heartbeat
            socket.on('ping', () => {
                socket.emit('pong', { timestamp: Date.now() });
            });
            // Handle disconnection
            socket.on('disconnect', (reason) => {
                this.handleDisconnection(clientId, reason);
            });
            // Handle errors
            socket.on('error', (error) => {
                logger_1.logger.error(`WebSocket error for client ${clientId}:`, error);
            });
        });
    }
    /**
     * Handle client subscription to data feeds
     */
    handleSubscription(clientId, data) {
        const client = this.connectedClients.get(clientId);
        if (!client)
            return;
        const { type, address, filters } = data;
        let roomName;
        switch (type) {
            case 'risk_updates':
                if (!address) {
                    logger_1.logger.warn(`Risk updates subscription requires address for client ${clientId}`);
                    return;
                }
                roomName = `risk_${address}`;
                break;
            case 'portfolio_updates':
                if (!address) {
                    logger_1.logger.warn(`Portfolio updates subscription requires address for client ${clientId}`);
                    return;
                }
                roomName = `portfolio_${address}`;
                break;
            case 'avs_updates':
                roomName = 'avs_updates';
                break;
            case 'market_data':
                roomName = 'market_data';
                break;
            default:
                logger_1.logger.warn(`Unknown subscription type: ${type} for client ${clientId}`);
                return;
        }
        // Join the room
        const socket = this.io.sockets.sockets.get(clientId);
        if (socket) {
            socket.join(roomName);
            client.subscriptions.add(roomName);
            logger_1.logger.info(`Client ${clientId} subscribed to ${roomName}`, {
                clientId,
                roomName,
                type,
                address,
                filters
            });
            // Send confirmation
            socket.emit('subscription_confirmed', {
                type,
                roomName,
                timestamp: Date.now()
            });
            // Send initial data if available
            this.sendInitialData(clientId, type, address);
        }
    }
    /**
     * Handle client unsubscription
     */
    handleUnsubscription(clientId, data) {
        const client = this.connectedClients.get(clientId);
        if (!client)
            return;
        const { type, address } = data;
        let roomName;
        switch (type) {
            case 'risk_updates':
                roomName = `risk_${address}`;
                break;
            case 'portfolio_updates':
                roomName = `portfolio_${address}`;
                break;
            case 'avs_updates':
                roomName = 'avs_updates';
                break;
            case 'market_data':
                roomName = 'market_data';
                break;
            default:
                return;
        }
        const socket = this.io.sockets.sockets.get(clientId);
        if (socket) {
            socket.leave(roomName);
            client.subscriptions.delete(roomName);
            logger_1.logger.info(`Client ${clientId} unsubscribed from ${roomName}`);
            socket.emit('unsubscription_confirmed', {
                type,
                roomName,
                timestamp: Date.now()
            });
        }
    }
    /**
     * Handle client authentication
     */
    handleAuthentication(clientId, data) {
        const client = this.connectedClients.get(clientId);
        if (!client)
            return;
        // In a real implementation, you would validate the token
        // For now, we'll just store the user ID
        client.userId = data.userId;
        logger_1.logger.info(`Client ${clientId} authenticated as user ${data.userId}`);
        const socket = this.io.sockets.sockets.get(clientId);
        if (socket) {
            socket.emit('authentication_confirmed', {
                userId: data.userId,
                timestamp: Date.now()
            });
        }
    }
    /**
     * Handle client disconnection
     */
    handleDisconnection(clientId, reason) {
        const client = this.connectedClients.get(clientId);
        if (client) {
            const connectionDuration = Date.now() - client.connectedAt;
            logger_1.logger.info(`WebSocket client disconnected: ${clientId}`, {
                clientId,
                userId: client.userId,
                reason,
                connectionDuration,
                subscriptions: Array.from(client.subscriptions)
            });
            this.connectedClients.delete(clientId);
        }
    }
    /**
     * Send initial data to newly subscribed clients
     */
    async sendInitialData(clientId, type, address) {
        const socket = this.io.sockets.sockets.get(clientId);
        if (!socket)
            return;
        try {
            switch (type) {
                case 'risk_updates':
                    // Send current risk status
                    socket.emit('risk:initial', {
                        message: 'Risk monitoring active',
                        timestamp: Date.now()
                    });
                    break;
                case 'portfolio_updates':
                    // Send current portfolio status
                    socket.emit('portfolio:initial', {
                        message: 'Portfolio monitoring active',
                        timestamp: Date.now()
                    });
                    break;
                case 'avs_updates':
                    // Send current AVS status
                    socket.emit('avs:initial', {
                        message: 'AVS monitoring active',
                        timestamp: Date.now()
                    });
                    break;
                case 'market_data':
                    // Send current market status
                    socket.emit('market:initial', {
                        message: 'Market data streaming active',
                        timestamp: Date.now()
                    });
                    break;
            }
        }
        catch (error) {
            logger_1.logger.error(`Error sending initial data to client ${clientId}:`, error);
        }
    }
    /**
     * Broadcast risk alert to subscribed clients
     */
    async broadcastRiskAlert(userAddress, alert) {
        const roomName = `risk_${userAddress}`;
        logger_1.logger.info(`Broadcasting risk alert to room ${roomName}`, {
            alertId: alert.id,
            severity: alert.severity,
            type: alert.type
        });
        this.io.to(roomName).emit('risk:alert', {
            type: 'risk_alert',
            data: alert,
            timestamp: Date.now()
        });
    }
    /**
     * Broadcast portfolio update to subscribed clients
     */
    async broadcastPortfolioUpdate(userAddress, portfolioData) {
        const roomName = `portfolio_${userAddress}`;
        logger_1.logger.info(`Broadcasting portfolio update to room ${roomName}`, {
            userAddress,
            updateFields: Object.keys(portfolioData)
        });
        this.io.to(roomName).emit('portfolio:update', {
            type: 'portfolio_update',
            data: portfolioData,
            timestamp: Date.now()
        });
    }
    /**
     * Broadcast AVS metrics update to all subscribers
     */
    async broadcastAVSUpdate(avsMetrics) {
        const roomName = 'avs_updates';
        logger_1.logger.info(`Broadcasting AVS update to room ${roomName}`, {
            avsCount: avsMetrics.length
        });
        this.io.to(roomName).emit('avs:update', {
            type: 'avs_update',
            data: avsMetrics,
            timestamp: Date.now()
        });
    }
    /**
     * Broadcast market data update to all subscribers
     */
    async broadcastMarketData(marketData) {
        const roomName = 'market_data';
        this.io.to(roomName).emit('market:update', {
            type: 'market_update',
            data: marketData,
            timestamp: Date.now()
        });
    }
    /**
     * Broadcast rebalance completion to user
     */
    async broadcastRebalanceComplete(userAddress, rebalanceData) {
        const roomName = `portfolio_${userAddress}`;
        logger_1.logger.info(`Broadcasting rebalance completion to room ${roomName}`, {
            userAddress,
            rebalanceId: rebalanceData.id
        });
        this.io.to(roomName).emit('portfolio:rebalance_complete', {
            type: 'rebalance_complete',
            data: rebalanceData,
            timestamp: Date.now()
        });
    }
    /**
     * Broadcast slashing event to all relevant users
     */
    async broadcastSlashingEvent(slashingEvent) {
        logger_1.logger.info('Broadcasting slashing event', {
            validatorAddress: slashingEvent.validatorAddress,
            amount: slashingEvent.amount
        });
        // Broadcast to all users monitoring this validator
        const affectedUsers = slashingEvent.affectedUsers || [];
        for (const userAddress of affectedUsers) {
            const roomName = `risk_${userAddress}`;
            this.io.to(roomName).emit('risk:slashing_event', {
                type: 'slashing_event',
                data: slashingEvent,
                timestamp: Date.now()
            });
        }
        // Also broadcast to general AVS room
        this.io.to('avs_updates').emit('avs:slashing_event', {
            type: 'slashing_event',
            data: slashingEvent,
            timestamp: Date.now()
        });
    }
    /**
     * Get connection statistics
     */
    getConnectionStats() {
        const stats = {
            totalConnections: this.connectedClients.size,
            authenticatedUsers: 0,
            subscriptionsByType: {},
            rooms: []
        };
        // Count authenticated users and subscriptions
        for (const client of this.connectedClients.values()) {
            if (client.userId) {
                stats.authenticatedUsers++;
            }
            for (const subscription of client.subscriptions) {
                const type = subscription.split('_')[0];
                stats.subscriptionsByType[type] = (stats.subscriptionsByType[type] || 0) + 1;
            }
        }
        // Get all rooms
        stats.rooms = Array.from(this.io.sockets.adapter.rooms.keys());
        return stats;
    }
    /**
     * Send system notification to all connected clients
     */
    async broadcastSystemNotification(notification) {
        logger_1.logger.info('Broadcasting system notification', notification);
        this.io.emit('system:notification', {
            type: 'system_notification',
            data: notification,
            timestamp: Date.now()
        });
    }
    /**
     * Broadcast price updates to market data subscribers
     */
    async broadcastPriceUpdate(priceData) {
        const roomName = 'market_data';
        this.io.to(roomName).emit('market:price_update', {
            type: 'price_update',
            data: priceData,
            timestamp: Date.now()
        });
    }
    /**
     * Clean up inactive connections
     */
    async cleanupInactiveConnections() {
        const now = Date.now();
        const maxIdleTime = 30 * 60 * 1000; // 30 minutes
        for (const [clientId, client] of this.connectedClients.entries()) {
            if (now - client.connectedAt > maxIdleTime) {
                const socket = this.io.sockets.sockets.get(clientId);
                if (socket) {
                    socket.disconnect(true);
                    logger_1.logger.info(`Disconnected idle client: ${clientId}`);
                }
            }
        }
    }
}
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=WebSocketService.js.map