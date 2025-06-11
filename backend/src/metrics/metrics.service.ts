import { Injectable, Logger } from '@nestjs/common';

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

  generateMockMetrics(): SystemMetrics {
    const timestamp = new Date().toISOString();
     
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
 
  getCurrentMetrics(): SystemMetrics {
    const metrics = this.generateMockMetrics();
    this.logger.debug(`Generated metrics: CPU ${metrics.cpu.usage}%, Memory ${metrics.memory.usage}%`);
    return metrics;
  }
 
  formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
 
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}