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
  private lastMetrics: SystemMetrics;
  private startTime = Date.now();

  // Keep some state for realistic variations
  private cpuBase = 20 + Math.random() * 30; // Base CPU usage 20-50%
  private memoryBase = 30 + Math.random() * 20; // Base memory usage 30-50%
  private diskBase = 40 + Math.random() * 20; // Base disk usage 40-60%

  constructor(private readonly metricsRepository: MetricsRepository) {}

  // Generate realistic mock system metrics
  generateMockMetrics(): SystemMetrics {
    const timestamp = new Date().toISOString();
    
    // Generate realistic variations around base values
    const cpuVariation = (Math.random() - 0.5) * 20; // ±10%
    const memoryVariation = (Math.random() - 0.5) * 10; // ±5%
    const diskVariation = (Math.random() - 0.5) * 2; // ±1%
    
    const cpuUsage = Math.max(0, Math.min(100, this.cpuBase + cpuVariation));
    
    const memoryTotal = 16 * 1024 * 1024 * 1024; // 16GB
    const memoryUsagePercent = Math.max(10, Math.min(90, this.memoryBase + memoryVariation));
    const memoryUsed = (memoryTotal * memoryUsagePercent) / 100;
    
    const diskTotal = 500 * 1024 * 1024 * 1024; // 500GB
    const diskUsagePercent = Math.max(20, Math.min(80, this.diskBase + diskVariation));
    const diskUsed = (diskTotal * diskUsagePercent) / 100;

    // Network with some realistic spikes
    const networkMultiplier = Math.random() > 0.9 ? 5 : 1; // 10% chance of spike
    const download = Math.random() * 50 * networkMultiplier; // 0-50 MB/s (up to 250 MB/s in spikes)
    const upload = Math.random() * 20 * networkMultiplier; // 0-20 MB/s (up to 100 MB/s in spikes)

    // System uptime (realistic)
    const uptime = Math.floor((Date.now() - this.startTime) / 1000) + Math.floor(Math.random() * 86400 * 7); // Current session + up to 7 days

    // Load averages (realistic for the CPU usage)
    const loadBase = cpuUsage / 100 * 2; // Scale with CPU
    const loadVariation = (Math.random() - 0.5) * 0.5;

    this.lastMetrics = {
      timestamp,
      cpu: {
        usage: Number(cpuUsage.toFixed(1)),
        cores: 8,
      },
      memory: {
        total: memoryTotal,
        used: Math.round(memoryUsed),
        free: Math.round(memoryTotal - memoryUsed),
        usage: Number(memoryUsagePercent.toFixed(1)),
      },
      disk: {
        total: diskTotal,
        used: Math.round(diskUsed),
        free: Math.round(diskTotal - diskUsed),
        usage: Number(diskUsagePercent.toFixed(1)),
      },
      network: {
        download: Number(download.toFixed(1)),
        upload: Number(upload.toFixed(1)),
      },
      system: {
        uptime: uptime,
        loadAverage: [
          Number((loadBase + loadVariation).toFixed(2)),
          Number((loadBase + loadVariation * 0.8).toFixed(2)),
          Number((loadBase + loadVariation * 0.6).toFixed(2)),
        ],
      },
    };

    return this.lastMetrics;
  }

  // Get current metrics
  getCurrentMetrics(): SystemMetrics {
    const metrics = this.generateMockMetrics();
    this.logger.debug(`Generated metrics: CPU ${metrics.cpu.usage}%, Memory ${metrics.memory.usage}%, Disk ${metrics.disk.usage}%`);
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

  // Adjust base values for testing different scenarios
  simulateLoad(type: 'low' | 'medium' | 'high') {
    switch (type) {
      case 'low':
        this.cpuBase = 10 + Math.random() * 20; // 10-30%
        this.memoryBase = 20 + Math.random() * 20; // 20-40%
        this.diskBase = 30 + Math.random() * 20; // 30-50%
        break;
      case 'medium':
        this.cpuBase = 40 + Math.random() * 30; // 40-70%
        this.memoryBase = 50 + Math.random() * 20; // 50-70%
        this.diskBase = 50 + Math.random() * 20; // 50-70%
        break;
      case 'high':
        this.cpuBase = 70 + Math.random() * 25; // 70-95%
        this.memoryBase = 70 + Math.random() * 20; // 70-90%
        this.diskBase = 70 + Math.random() * 20; // 70-90%
        break;
    }
    this.logger.log(`Simulating ${type} load scenario`);
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