import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { AlertsService } from '../websocket/alerts.service';
export declare class MetricsCollectorService implements OnModuleInit, OnModuleDestroy {
    private readonly metricsService;
    private readonly webSocketGateway;
    private readonly alertsService;
    private logger;
    private collectionInterval;
    private broadcastInterval;
    private isCollecting;
    constructor(metricsService: MetricsService, webSocketGateway: WebSocketGateway, alertsService: AlertsService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    startCollection(): void;
    stopCollection(): void;
    collectNow(): Promise<void>;
    getStatus(): {
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
    triggerTestAlerts(): Promise<void>;
}
