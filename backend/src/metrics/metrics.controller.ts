import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';

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
}