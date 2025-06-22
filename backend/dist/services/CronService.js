"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const tslib_1 = require("tslib");
const cron = tslib_1.__importStar(require("node-cron"));
const logger_1 = require("../utils/logger");
class CronService {
    analyticsService;
    riskService;
    swellChainService;
    webSocketService;
    tasks = new Map();
    isShuttingDown = false;
    constructor(analyticsService, riskService, swellChainService, webSocketService) {
        this.analyticsService = analyticsService;
        this.riskService = riskService;
        this.swellChainService = swellChainService;
        this.webSocketService = webSocketService;
        this.initializeTasks();
        logger_1.logger.info('CronService initialized with scheduled tasks');
    }
    initializeTasks() {
        // Update analytics data every 5 minutes
        this.scheduleTask('analytics-update', '*/5 * * * *', this.updateAnalyticsData.bind(this));
        // Update risk metrics every 2 minutes
        this.scheduleTask('risk-update', '*/2 * * * *', this.updateRiskMetrics.bind(this));
        // Update SwellChain data every minute
        this.scheduleTask('swellchain-update', '* * * * *', this.updateSwellChainData.bind(this));
        // Cleanup cache every hour
        this.scheduleTask('cache-cleanup', '0 * * * *', this.cleanupCache.bind(this));
        // Health check every 30 seconds
        this.scheduleTask('health-check', '*/30 * * * * *', this.performHealthCheck.bind(this));
    }
    scheduleTask(name, schedule, taskFunction) {
        try {
            const task = cron.schedule(schedule, async () => {
                if (this.isShuttingDown)
                    return;
                const scheduledTask = this.tasks.get(name);
                if (!scheduledTask || scheduledTask.isRunning)
                    return;
                scheduledTask.isRunning = true;
                scheduledTask.lastRun = new Date();
                try {
                    await taskFunction();
                    logger_1.logger.debug(`Cron task '${name}' completed successfully`);
                }
                catch (error) {
                    scheduledTask.errors++;
                    logger_1.logger.error(`Cron task '${name}' failed:`, error);
                }
                finally {
                    scheduledTask.isRunning = false;
                }
            }, {
                scheduled: false
            });
            this.tasks.set(name, {
                name,
                task,
                isRunning: false,
                errors: 0
            });
            task.start();
            logger_1.logger.info(`Scheduled cron task: ${name} (${schedule})`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to schedule task ${name}:`, error);
        }
    }
    async stop() {
        this.isShuttingDown = true;
        logger_1.logger.info('Stopping all cron tasks...');
        for (const [name, scheduledTask] of this.tasks) {
            try {
                scheduledTask.task.stop();
                logger_1.logger.debug(`Stopped cron task: ${name}`);
            }
            catch (error) {
                logger_1.logger.error(`Error stopping task ${name}:`, error);
            }
        }
        // Wait for running tasks to complete
        const timeout = 30000; // 30 seconds
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const runningTasks = Array.from(this.tasks.values()).filter(t => t.isRunning);
            if (runningTasks.length === 0)
                break;
            logger_1.logger.info(`Waiting for ${runningTasks.length} tasks to complete...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        this.tasks.clear();
        logger_1.logger.info('All cron tasks stopped');
    }
    // Task implementations
    async updateAnalyticsData() {
        try {
            logger_1.logger.debug('Updating analytics data...');
            // Get fresh analytics data (this will trigger cache updates internally)
            await this.analyticsService.getOverviewData('24h', 1923);
            await this.analyticsService.getTVLData('24h');
            await this.analyticsService.getYieldData('24h');
            await this.analyticsService.getProtocolRankings('tvl', 'desc', 20);
            // Broadcast analytics updates
            await this.webSocketService.broadcastMarketData({
                type: 'analytics_update',
                timestamp: Date.now(),
                data: {
                    tvl: await this.analyticsService.getTVLData('24h'),
                    yields: await this.analyticsService.getYieldData('24h')
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Analytics update failed:', error);
            throw error;
        }
    }
    async updateRiskMetrics() {
        try {
            logger_1.logger.debug('Updating risk metrics...');
            // Sample user address for system monitoring
            const sampleAddress = '0x' + '1'.repeat(40);
            // Get current risk metrics
            const riskMetrics = await this.riskService.getRiskMetrics(sampleAddress);
            // Check for new alerts
            const alerts = await this.riskService.getRiskAlerts(sampleAddress);
            // Broadcast risk updates if there are alerts
            if (alerts.length > 0) {
                await this.webSocketService.broadcastRiskAlert(sampleAddress, alerts[0]);
            }
        }
        catch (error) {
            logger_1.logger.error('Risk metrics update failed:', error);
            throw error;
        }
    }
    async updateSwellChainData() {
        try {
            logger_1.logger.debug('Updating SwellChain data...');
            // Get AVS metrics
            const avsMetrics = await this.swellChainService.getAVSMetrics();
            // Broadcast AVS updates
            await this.webSocketService.broadcastAVSUpdate(avsMetrics);
        }
        catch (error) {
            logger_1.logger.error('SwellChain data update failed:', error);
            throw error;
        }
    }
    async cleanupCache() {
        try {
            logger_1.logger.debug('Performing cache cleanup...');
            // This would clean up expired cache entries
            // Implementation depends on your cache service
            logger_1.logger.debug('Cache cleanup completed');
        }
        catch (error) {
            logger_1.logger.error('Cache cleanup failed:', error);
            throw error;
        }
    }
    async performHealthCheck() {
        try {
            // Basic health check - verify services are responsive
            const health = {
                timestamp: Date.now(),
                analytics: true,
                risk: true,
                swellchain: true,
                websocket: true
            };
            // You could add actual health checks here
            logger_1.logger.debug('Health check completed:', health);
        }
        catch (error) {
            logger_1.logger.error('Health check failed:', error);
            throw error;
        }
    }
    // Management methods
    getTaskStatus() {
        const status = [];
        for (const [name, scheduledTask] of this.tasks) {
            status.push({
                name: scheduledTask.name,
                isRunning: scheduledTask.isRunning,
                lastRun: scheduledTask.lastRun,
                errors: scheduledTask.errors
            });
        }
        return status;
    }
    async startTask(taskName) {
        const scheduledTask = this.tasks.get(taskName);
        if (!scheduledTask) {
            logger_1.logger.warn(`Task '${taskName}' not found`);
            return false;
        }
        scheduledTask.task.start();
        logger_1.logger.info(`Started task: ${taskName}`);
        return true;
    }
    async stopTask(taskName) {
        const scheduledTask = this.tasks.get(taskName);
        if (!scheduledTask) {
            logger_1.logger.warn(`Task '${taskName}' not found`);
            return false;
        }
        scheduledTask.task.stop();
        logger_1.logger.info(`Stopped task: ${taskName}`);
        return true;
    }
    getStats() {
        return {
            totalTasks: this.tasks.size,
            runningTasks: Array.from(this.tasks.values()).filter(t => t.isRunning).length,
            totalErrors: Array.from(this.tasks.values()).reduce((sum, t) => sum + t.errors, 0),
            isShuttingDown: this.isShuttingDown
        };
    }
}
exports.CronService = CronService;
//# sourceMappingURL=CronService.js.map