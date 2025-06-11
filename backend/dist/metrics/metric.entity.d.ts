export declare class Metric {
    id: number;
    timestamp: Date;
    metricType: string;
    cpuUsage: number;
    cpuCores: number;
    loadAvg1: number;
    loadAvg5: number;
    loadAvg15: number;
    memoryTotal: number;
    memoryUsed: number;
    memoryFree: number;
    memoryUsage: number;
    diskTotal: number;
    diskUsed: number;
    diskFree: number;
    diskUsage: number;
    networkDownload: number;
    networkUpload: number;
    uptime: number;
    processCount: number;
    temperature: number;
    createdAt: Date;
}
