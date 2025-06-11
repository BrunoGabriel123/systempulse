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
    private logger;
    generateMockMetrics(): SystemMetrics;
    getCurrentMetrics(): SystemMetrics;
    formatBytes(bytes: number): string;
    formatUptime(seconds: number): string;
}
