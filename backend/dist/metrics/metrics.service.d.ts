import { MetricsRepository } from './metrics.repository';
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
export declare class MetricsService {
    private readonly metricsRepository;
    private logger;
    private lastMetrics;
    private startTime;
    private cpuBase;
    private memoryBase;
    private diskBase;
    constructor(metricsRepository: MetricsRepository);
    generateMockMetrics(): SystemMetrics;
    getCurrentMetrics(): SystemMetrics;
    saveMetrics(systemMetrics: SystemMetrics): Promise<Metric[]>;
    getMetrics(query: QueryMetricsDto): Promise<Metric[]>;
    getLatestMetrics(): Promise<Metric[]>;
    getAggregatedMetrics(metricType: string, interval: string, startDate: Date, endDate: Date): Promise<any[]>;
    cleanOldMetrics(olderThanDays?: number): Promise<number>;
    getStats(): Promise<{
        total: number;
        oldestTimestamp: Date;
        newestTimestamp: Date;
    }>;
    simulateLoad(type: 'low' | 'medium' | 'high'): void;
    formatBytes(bytes: number): string;
    formatUptime(seconds: number): string;
}
