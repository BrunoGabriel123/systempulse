import { MetricsService } from './metrics.service';
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
}
