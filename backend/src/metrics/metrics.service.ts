import { Injectable, Logger } from '@nestjs/common';
import { MetricsRepository } from './metrics.repository';
import { CreateMetricDto } from './dto/create-metric.dto';
import { QueryMetricsDto } from './dto/query-metrics.dto'; 
import { Metric } from './metric.entity';

export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    download: number;
    upload: number;
  };
  system: {
    uptime: number;
    loadAverage: number[];
  };
}

@Injectable()
export class MetricsService {
  private logger = new Logger('MetricsService');

  constructor(private readonly metricsRepository: MetricsRepository) {}

  // Generate mock system metrics (we'll replace with real data later)
  generateMockMetrics(): SystemMetrics {
    const timestamp = new Date().toISOString();
    
    // Generate realistic mock data
    const cpuUsage = Math.random() * 100;
    const memoryTotal = 16 * 1024 * 1024 * 1024; // 16GB
    const memoryUsed = memoryTotal * (0.3 + Math.random() * 0.4); // 30-70% usage
    const diskTotal = 500 * 1024 * 1024 * 1024; // 500GB
    const diskUsed = diskTotal * (0.2 + Math.random() * 0.6); // 20-80% usage

    return {
      timestamp,
      cpu: {
        usage: Number(cpuUsage.toFixed(1)),
        cores: 8,
      },
      memory: {
        total: memoryTotal,
        used: memoryUsed,
        free: memoryTotal - memoryUsed,
        usage: Number(((memoryUsed / memoryTotal) * 100).toFixed(1)),
      },
      disk: {
        total: diskTotal,
        used: diskUsed,
        free: diskTotal - diskUsed,
        usage: Number(((diskUsed / diskTotal) * 100).toFixed(1)),
      },
      network: {
        download: Number((Math.random() * 100).toFixed(1)), // MB/s
        upload: Number((Math.random() * 50).toFixed(1)),    // MB/s
      },
      system: {
        uptime: Math.floor(Math.random() * 86400), // seconds
        loadAverage: [
          Number((Math.random() * 2).toFixed(2)),
          Number((Math.random() * 2).toFixed(2)),
          Number((Math.random() * 2).toFixed(2)),
        ],
      },
    };
  }

  // Get current metrics
  getCurrentMetrics(): SystemMetrics {
    const metrics = this.generateMockMetrics();
    this.logger.debug(`Generated metrics: CPU ${metrics.cpu.usage}%, Memory ${metrics.memory.usage}%`);
    return metrics;
  }

  // Save metrics to database
  async saveMetrics(systemMetrics: SystemMetrics): Promise<Metric[]> {
    const timestamp = new Date(systemMetrics.timestamp);
    const savedMetrics: Metric[] = [];

    try {
      // Save CPU metrics
      const cpuMetric = await this.metricsRepository.save({
        timestamp,
        metricType: 'cpu',
        cpuUsage: systemMetrics.cpu.usage,
        cpuCores: systemMetrics.cpu.cores,
        loadAvg1: systemMetrics.system.loadAverage[0],
        loadAvg5: systemMetrics.system.loadAverage[1],
        loadAvg15: systemMetrics.system.loadAverage[2],
      });
      savedMetrics.push(cpuMetric);

      // Save Memory metrics
      const memoryMetric = await this.metricsRepository.save({
        timestamp,
        metricType: 'memory',
        memoryTotal: systemMetrics.memory.total,
        memoryUsed: systemMetrics.memory.used,
        memoryFree: systemMetrics.memory.free,
        memoryUsage: systemMetrics.memory.usage,
      });
      savedMetrics.push(memoryMetric);

      // Save Disk metrics
      const diskMetric = await this.metricsRepository.save({
        timestamp,
        metricType: 'disk',
        diskTotal: systemMetrics.disk.total,
        diskUsed: systemMetrics.disk.used,
        diskFree: systemMetrics.disk.free,
        diskUsage: systemMetrics.disk.usage,
      });
      savedMetrics.push(diskMetric);

      // Save Network metrics
      const networkMetric = await this.metricsRepository.save({
        timestamp,
        metricType: 'network',
        networkDownload: systemMetrics.network.download,
        networkUpload: systemMetrics.network.upload,
      });
      savedMetrics.push(networkMetric);

      // Save System metrics
      const systemMetric = await this.metricsRepository.save({
        timestamp,
        metricType: 'system',
        uptime: systemMetrics.system.uptime,
      });
      savedMetrics.push(systemMetric);

      this.logger.log(`Saved ${savedMetrics.length} metrics to database`);
      return savedMetrics;
    } catch (error) {
      this.logger.error(`Failed to save metrics: ${error.message}`);
      throw error;
    }
  }

  // Get metrics from database
  async getMetrics(query: QueryMetricsDto): Promise<Metric[]> {
    return this.metricsRepository.findWithFilters(query);
  }

  // Get latest metrics for each type
  async getLatestMetrics(): Promise<Metric[]> {
    return this.metricsRepository.getLatestMetrics();
  }

  // Get aggregated metrics
  async getAggregatedMetrics(
    metricType: string,
    interval: string,
    startDate: Date,
    endDate: Date,
  ) {
    return this.metricsRepository.getAggregatedMetrics(
      metricType,
      interval,
      startDate,
      endDate,
    );
  }

  // Clean old metrics
  async cleanOldMetrics(olderThanDays: number = 30): Promise<number> {
    const deleted = await this.metricsRepository.deleteOldMetrics(olderThanDays);
    this.logger.log(`Deleted ${deleted} old metrics`);
    return deleted;
  }

  // Get database stats
  async getStats() {
    return this.metricsRepository.getMetricsStats();
  }

  // Format bytes to human readable
  formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Format uptime to human readable
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}