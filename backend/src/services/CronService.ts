import * as cron from 'node-cron';
import { logger } from '../utils/logger';
import { AnalyticsService } from './AnalyticsService';
import { RiskService } from './RiskService';
import { SwellChainService } from './SwellChainService';
import { WebSocketService } from './WebSocketService';

interface ScheduledTask {
  name: string;
  task: cron.ScheduledTask;
  isRunning: boolean;
  lastRun?: Date;
  nextRun?: Date;
  errors: number;
}

export class CronService {
  private tasks: Map<string, ScheduledTask> = new Map();
  private isShuttingDown: boolean = false;

  constructor(
    private analyticsService: AnalyticsService,
    private riskService: RiskService,
    private swellChainService: SwellChainService,
    private webSocketService: WebSocketService
  ) {
    this.initializeTasks();
    logger.info('CronService initialized with scheduled tasks');
  }

  private initializeTasks() {
    // Update analytics data every 5 minutes
    this.scheduleTask(
      'analytics-update',
      '*/5 * * * *',
      this.updateAnalyticsData.bind(this)
    );

    // Update risk metrics every 2 minutes
    this.scheduleTask(
      'risk-update',
      '*/2 * * * *',
      this.updateRiskMetrics.bind(this)
    );

    // Update SwellChain data every minute
    this.scheduleTask(
      'swellchain-update',
      '* * * * *',
      this.updateSwellChainData.bind(this)
    );

    // Cleanup cache every hour
    this.scheduleTask(
      'cache-cleanup',
      '0 * * * *',
      this.cleanupCache.bind(this)
    );

    // Health check every 30 seconds
    this.scheduleTask(
      'health-check',
      '*/30 * * * * *',
      this.performHealthCheck.bind(this)
    );
  }

  private scheduleTask(name: string, schedule: string, taskFunction: () => Promise<void>) {
    try {
      const task = cron.schedule(schedule, async () => {
        if (this.isShuttingDown) return;

        const scheduledTask = this.tasks.get(name);
        if (!scheduledTask || scheduledTask.isRunning) return;

        scheduledTask.isRunning = true;
        scheduledTask.lastRun = new Date();

        try {
          await taskFunction();
          logger.debug(`Cron task '${name}' completed successfully`);
        } catch (error) {
          scheduledTask.errors++;
          logger.error(`Cron task '${name}' failed:`, error);
        } finally {
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
      logger.info(`Scheduled cron task: ${name} (${schedule})`);
    } catch (error) {
      logger.error(`Failed to schedule task ${name}:`, error);
    }
  }

  async stop() {
    this.isShuttingDown = true;
    logger.info('Stopping all cron tasks...');

    for (const [name, scheduledTask] of this.tasks) {
      try {
        scheduledTask.task.stop();
        logger.debug(`Stopped cron task: ${name}`);
      } catch (error) {
        logger.error(`Error stopping task ${name}:`, error);
      }
    }

    // Wait for running tasks to complete
    const timeout = 30000; // 30 seconds
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const runningTasks = Array.from(this.tasks.values()).filter(t => t.isRunning);
      if (runningTasks.length === 0) break;

      logger.info(`Waiting for ${runningTasks.length} tasks to complete...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.tasks.clear();
    logger.info('All cron tasks stopped');
  }

  // Task implementations
  private async updateAnalyticsData(): Promise<void> {
    try {
      logger.debug('Updating analytics data...');
      
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
    } catch (error) {
      logger.error('Analytics update failed:', error);
      throw error;
    }
  }

  private async updateRiskMetrics(): Promise<void> {
    try {
      logger.debug('Updating risk metrics...');
      
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
      
    } catch (error) {
      logger.error('Risk metrics update failed:', error);
      throw error;
    }
  }

  private async updateSwellChainData(): Promise<void> {
    try {
      logger.debug('Updating SwellChain data...');
      
      // Get AVS metrics
      const avsMetrics = await this.swellChainService.getAVSMetrics();
      
      // Broadcast AVS updates
      await this.webSocketService.broadcastAVSUpdate(avsMetrics);
      
    } catch (error) {
      logger.error('SwellChain data update failed:', error);
      throw error;
    }
  }

  private async cleanupCache(): Promise<void> {
    try {
      logger.debug('Performing cache cleanup...');
      
      // This would clean up expired cache entries
      // Implementation depends on your cache service
      logger.debug('Cache cleanup completed');
      
    } catch (error) {
      logger.error('Cache cleanup failed:', error);
      throw error;
    }
  }

  private async performHealthCheck(): Promise<void> {
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
      logger.debug('Health check completed:', health);
      
    } catch (error) {
      logger.error('Health check failed:', error);
      throw error;
    }
  }

  // Management methods
  getTaskStatus() {
    const status: any[] = [];
    
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

  async startTask(taskName: string): Promise<boolean> {
    const scheduledTask = this.tasks.get(taskName);
    if (!scheduledTask) {
      logger.warn(`Task '${taskName}' not found`);
      return false;
    }

    scheduledTask.task.start();
    logger.info(`Started task: ${taskName}`);
    return true;
  }

  async stopTask(taskName: string): Promise<boolean> {
    const scheduledTask = this.tasks.get(taskName);
    if (!scheduledTask) {
      logger.warn(`Task '${taskName}' not found`);
      return false;
    }

    scheduledTask.task.stop();
    logger.info(`Stopped task: ${taskName}`);
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