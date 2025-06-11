import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
export declare class MetricsCollectorService implements OnModuleInit, OnModuleDestroy {
    private readonly metricsService;
    private readonly webSocketGateway;
    private logger;
    private collectionInterval;
    private broadcastInterval;
    private isCollecting;
    constructor(metricsService: MetricsService, webSocketGateway: WebSocketGateway);
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
    };
}
