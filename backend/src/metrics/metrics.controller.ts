import { Controller, Get, Post, Body, Query, ValidationPipe } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { QueryMetricsDto } from './dto/query-metrics.dto';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

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

  @Post()
  async saveCurrentMetrics() {
    const metrics = this.metricsService.getCurrentMetrics();
    return this.metricsService.saveMetrics(metrics);
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