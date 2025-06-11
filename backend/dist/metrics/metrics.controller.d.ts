import { MetricsService } from './metrics.service';
import { MetricsCollectorService } from './metrics-collector.service';
import { AlertsService } from '../websocket/alerts.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { QueryMetricsDto } from './dto/query-metrics.dto';
export declare class MetricsController {
    private readonly metricsService;
    private readonly metricsCollectorService;
    private readonly alertsService;
    private readonly webSocketGateway;
    constructor(metricsService: MetricsService, metricsCollectorService: MetricsCollectorService, alertsService: AlertsService, webSocketGateway: WebSocketGateway);
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
    getPerformanceStats(): {
        server: {
            uptime: number;
            memoryUsage: NodeJS.MemoryUsage;
            cpuUsage: NodeJS.CpuUsage;
            nodeVersion: string;
            platform: NodeJS.Platform;
        };
        websocket: {
            total: number;
            subscribersCount: number;
            clients: {
                id: string;
                connected: boolean;
                rooms: string[];
                handshake: {
                    address: string;
                    time: string;
                    headers: {
                        'user-agent': string;
                        origin: string;
                    };
                };
            }[];
            serverStats: {
                uptime: number;
                memoryUsage: NodeJS.MemoryUsage;
                lastBroadcast: any;
            };
        };
        collector: {
            isCollecting: boolean;
            collectionInterval: number;
            broadcastInterval: number;
            connectedClients: number;
            alertStats: {
                total: number;
                last24h: number;
                byLevel: Record<string, number>;
                byMetric: Record<string, number>;
                lastAlert: {
                    timestamp: Date;
                    level: string;
                    metric: string;
                    value: number;
                    message: string;
                };
            };
        };
        alerts: {
            total: number;
            last24h: number;
            byLevel: Record<string, number>;
            byMetric: Record<string, number>;
            lastAlert: {
                timestamp: Date;
                level: string;
                metric: string;
                value: number;
                message: string;
            };
        };
        timestamp: string;
    };
    getCollectorStatus(): {
        isCollecting: boolean;
        collectionInterval: number;
        broadcastInterval: number;
        connectedClients: number;
        alertStats: {
            total: number;
            last24h: number;
            byLevel: Record<string, number>;
            byMetric: Record<string, number>;
            lastAlert: {
                timestamp: Date;
                level: string;
                metric: string;
                value: number;
                message: string;
            };
        };
    };
    getAlertHistory(limit?: string): {
        id: string;
        timestamp: Date;
        level: string;
        metric: string;
        value: number;
        message: string;
    }[];
    getAlertThresholds(): import("../websocket/alerts.service").AlertThreshold[];
    getAlertStats(): {
        total: number;
        last24h: number;
        byLevel: Record<string, number>;
        byMetric: Record<string, number>;
        lastAlert: {
            timestamp: Date;
            level: string;
            metric: string;
            value: number;
            message: string;
        };
    };
    getWebSocketClients(): {
        total: number;
        subscribersCount: number;
        clients: {
            id: string;
            connected: boolean;
            rooms: string[];
            handshake: {
                address: string;
                time: string;
                headers: {
                    'user-agent': string;
                    origin: string;
                };
            };
        }[];
        serverStats: {
            uptime: number;
            memoryUsage: NodeJS.MemoryUsage;
            lastBroadcast: any;
        };
    };
    saveCurrentMetrics(): Promise<import("./metric.entity").Metric[]>;
    collectNow(): Promise<{
        message: string;
        timestamp: string;
    }>;
    simulateLoad(type: 'low' | 'medium' | 'high'): Promise<{
        message: string;
        timestamp: string;
    }>;
    startCollector(): {
        message: string;
        status: {
            isCollecting: boolean;
            collectionInterval: number;
            broadcastInterval: number;
            connectedClients: number;
            alertStats: {
                total: number;
                last24h: number;
                byLevel: Record<string, number>;
                byMetric: Record<string, number>;
                lastAlert: {
                    timestamp: Date;
                    level: string;
                    metric: string;
                    value: number;
                    message: string;
                };
            };
        };
    };
    stopCollector(): {
        message: string;
        status: {
            isCollecting: boolean;
            collectionInterval: number;
            broadcastInterval: number;
            connectedClients: number;
            alertStats: {
                total: number;
                last24h: number;
                byLevel: Record<string, number>;
                byMetric: Record<string, number>;
                lastAlert: {
                    timestamp: Date;
                    level: string;
                    metric: string;
                    value: number;
                    message: string;
                };
            };
        };
    };
    triggerTestAlerts(): Promise<{
        message: string;
        timestamp: string;
    }>;
    clearAlertCooldowns(): {
        message: string;
        timestamp: string;
    };
    broadcastNotification(body: {
        message: string;
        type?: string;
    }): {
        message: string;
        timestamp: string;
    };
    broadcastPerformanceMetrics(): {
        message: string;
        timestamp: string;
    };
    cleanupOldMetrics(days?: string): Promise<{
        deleted: number;
        message: string;
    }>;
}
