import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { AlertsService } from '../websocket/alerts.service';

@Injectable()
export class MetricsCollectorService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger('MetricsCollectorService');
  private collectionInterval: NodeJS.Timeout;
  private broadcastInterval: NodeJS.Timeout;
  private isCollecting = false;

  constructor(
    private readonly metricsService: MetricsService,
    private readonly webSocketGateway: WebSocketGateway,
    private readonly alertsService: AlertsService,
  ) {}

  onModuleInit() {
    this.logger.log('Starting metrics collection...');
    this.startCollection();
  }

  onModuleDestroy() {
    this.stopCollection();
  }

  startCollection() {
    if (this.isCollecting) {
      this.logger.warn('Metrics collection already running');
      return;
    }

    this.isCollecting = true;

    // Collect and save metrics every 30 seconds
    this.collectionInterval = setInterval(async () => {
      try {
        const metrics = this.metricsService.getCurrentMetrics();
        await this.metricsService.saveMetrics(metrics);
        this.logger.debug('Metrics collected and saved');
      } catch (error) {
        this.logger.error(`Failed to collect metrics: ${error.message}`);
      }
    }, 30000); // 30 seconds

    // Broadcast real-time metrics every 2 seconds
    this.broadcastInterval = setInterval(() => {
      try {
        const metrics = this.metricsService.getCurrentMetrics();
        
        // Check for alerts
        const alerts = this.alertsService.checkMetrics(metrics);
        
        // Broadcast metrics
        this.webSocketGateway.broadcastMetrics({
          type: 'metrics_update',
          data: metrics,
          timestamp: new Date().toISOString(),
        });

        // Broadcast alerts if any
        alerts.forEach(alert => {
          this.webSocketGateway.broadcastAlert(alert);
        });

        this.logger.debug(`Real-time metrics broadcasted${alerts.length > 0 ? ` with ${alerts.length} alerts` : ''}`);
      } catch (error) {
        this.logger.error(`Failed to broadcast metrics: ${error.message}`);
      }
    }, 2000); // 2 seconds

    this.logger.log('Metrics collection started - collecting every 30s, broadcasting every 2s');
  }

  stopCollection() {
    if (!this.isCollecting) {
      return;
    }

    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }

    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
    }

    this.isCollecting = false;
    this.logger.log('Metrics collection stopped');
  }

  // Manual collection trigger
  async collectNow(): Promise<void> {
    const metrics = this.metricsService.getCurrentMetrics();
    await this.metricsService.saveMetrics(metrics);
    
    // Check for alerts
    const alerts = this.alertsService.checkMetrics(metrics);
    
    // Broadcast immediately
    this.webSocketGateway.broadcastMetrics({
      type: 'metrics_update',
      data: metrics,
      timestamp: new Date().toISOString(),
    });

    // Broadcast alerts if any
    alerts.forEach(alert => {
      this.webSocketGateway.broadcastAlert(alert);
    });

    this.logger.log(`Manual metrics collection triggered${alerts.length > 0 ? ` with ${alerts.length} alerts` : ''}`);
  }

  // Get collection status
  getStatus() {
    return {
      isCollecting: this.isCollecting,
      collectionInterval: 30000, // 30 seconds
      broadcastInterval: 2000,   // 2 seconds
      connectedClients: this.webSocketGateway.getConnectedClientsCount(),
      alertStats: this.alertsService.getStats(),
    };
  }

  // Trigger test alerts
  async triggerTestAlerts() {
    this.logger.log('Triggering test alerts...');
    
    // Simulate high load temporarily
    this.metricsService.simulateLoad('high');
    
    // Wait a moment then collect
    setTimeout(async () => {
      await this.collectNow();
      
      // Reset to normal after test
      setTimeout(() => {
        this.metricsService.simulateLoad('low');
      }, 5000);
    }, 1000);
  }
}