import { Controller, Get, Post, Body, Query, ValidationPipe, Param } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsCollectorService } from './metrics-collector.service';
import { AlertsService } from '../websocket/alerts.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { CreateMetricDto } from './dto/create-metric.dto';
import { QueryMetricsDto } from './dto/query-metrics.dto';

@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly metricsCollectorService: MetricsCollectorService,
    private readonly alertsService: AlertsService,
    private readonly webSocketGateway: WebSocketGateway,
  ) {}

  @Get()
  getCurrentMetrics() {
    return this.metricsService.getCurrentMetrics();
  }

  @Get('formatted')
  getFormattedMetrics() {
    const metrics = this.metricsService.getCurrentMetrics();
    
    return {
      ...metrics,
      memory: {
        ...metrics.memory,
        totalFormatted: this.metricsService.formatBytes(metrics.memory.total),
        usedFormatted: this.metricsService.formatBytes(metrics.memory.used),
        freeFormatted: this.metricsService.formatBytes(metrics.memory.free),
      },
      disk: {
        ...metrics.disk,
        totalFormatted: this.metricsService.formatBytes(metrics.disk.total),
        usedFormatted: this.metricsService.formatBytes(metrics.disk.used),
        freeFormatted: this.metricsService.formatBytes(metrics.disk.free),
      },
      system: {
        ...metrics.system,
        uptimeFormatted: this.metricsService.formatUptime(metrics.system.uptime),
      },
    };
  }

  @Get('history')
  async getMetricsHistory(@Query(new ValidationPipe({ transform: true })) query: QueryMetricsDto) {
    return this.metricsService.getMetrics(query);
  }

  @Get('latest')
  async getLatestMetrics() {
    return this.metricsService.getLatestMetrics();
  }

  @Get('aggregated')
  async getAggregatedMetrics(
    @Query('metricType') metricType: string = 'all',
    @Query('interval') interval: string = '1h',
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24h
    const end = endDate ? new Date(endDate) : new Date();

    return this.metricsService.getAggregatedMetrics(metricType, interval, start, end);
  }

  @Get('stats')
  async getStats() {
    return this.metricsService.getStats();
  }

  @Get('collector/status')
  getCollectorStatus() {
    return this.metricsCollectorService.getStatus();
  }

  @Get('alerts/history')
  getAlertHistory(@Query('limit') limit: string = '50') {
    return this.alertsService.getAlertHistory(parseInt(limit, 10));
  }

  @Get('alerts/thresholds')
  getAlertThresholds() {
    return this.alertsService.getThresholds();
  }

  @Get('alerts/stats')
  getAlertStats() {
    return this.alertsService.getStats();
  }

  @Get('websocket/clients')
  getWebSocketClients() {
    return this.webSocketGateway.getConnectedClientsInfo();
  }

  @Post()
  async saveCurrentMetrics() {
    const metrics = this.metricsService.getCurrentMetrics();
    return this.metricsService.saveMetrics(metrics);
  }

  @Post('collect')
  async collectNow() {
    await this.metricsCollectorService.collectNow();
    return {
      message: 'Metrics collected and broadcasted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('simulate/:type')
  async simulateLoad(@Param('type') type: 'low' | 'medium' | 'high') {
    this.metricsService.simulateLoad(type);
    return {
      message: `Simulating ${type} load scenario`,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('collector/start')
  startCollector() {
    this.metricsCollectorService.startCollection();
    return {
      message: 'Metrics collector started',
      status: this.metricsCollectorService.getStatus(),
    };
  }

  @Post('collector/stop')
  stopCollector() {
    this.metricsCollectorService.stopCollection();
    return {
      message: 'Metrics collector stopped',
      status: this.metricsCollectorService.getStatus(),
    };
  }

  @Post('alerts/test')
  async triggerTestAlerts() {
    await this.metricsCollectorService.triggerTestAlerts();
    return {
      message: 'Test alerts triggered - check real-time feed',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('alerts/clear-cooldowns')
  clearAlertCooldowns() {
    this.alertsService.clearCooldowns();
    return {
      message: 'Alert cooldowns cleared',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('websocket/notification')
  broadcastNotification(@Body() body: { message: string; type?: string }) {
    this.webSocketGateway.broadcastNotification({
      message: body.message,
      type: body.type || 'info',
    });
    return {
      message: 'Notification broadcasted',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('cleanup')
  async cleanupOldMetrics(@Query('days') days: string = '30') {
    const olderThanDays = parseInt(days, 10);
    return {
      deleted: await this.metricsService.cleanOldMetrics(olderThanDays),
      message: `Deleted metrics older than ${olderThanDays} days`,
    };
  }
}