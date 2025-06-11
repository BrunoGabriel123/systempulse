import { MetricsService } from './metrics.service';
import { QueryMetricsDto } from './dto/query-metrics.dto';
export declare class MetricsController {
    private readonly metricsService;
    constructor(metricsService: MetricsService);
    getCurrentMetrics(): import("./metrics.service").SystemMetrics;
    getFormattedMetrics(): {
        memory: {
            totalFormatted: string;
            usedFormatted: string;
            freeFormatted: string;
            total: number;
            used: number;
            free: number;
            usage: number;
        };
        disk: {
            totalFormatted: string;
            usedFormatted: string;
            freeFormatted: string;
            total: number;
            used: number;
            free: number;
            usage: number;
        };
        system: {
            uptimeFormatted: string;
            uptime: number;
            loadAverage: number[];
        };
        timestamp: string;
        cpu: {
            usage: number;
            cores: number;
        };
        network: {
            download: number;
            upload: number;
        };
    };
    getMetricsHistory(query: QueryMetricsDto): Promise<import("./metric.entity").Metric[]>;
    getLatestMetrics(): Promise<import("./metric.entity").Metric[]>;
    getAggregatedMetrics(metricType: string, interval: string, startDate: string, endDate: string): Promise<any[]>;
    getStats(): Promise<{
        total: number;
        oldestTimestamp: Date;
        newestTimestamp: Date;
    }>;
    saveCurrentMetrics(): Promise<import("./metric.entity").Metric[]>;
    cleanupOldMetrics(days?: string): Promise<{
        deleted: number;
        message: string;
    }>;
}
