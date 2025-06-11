import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    private connectedClients;
    private lastMetricsBroadcast;
    private metricsThrottleTime;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handlePing(client: Socket): void;
    handleSubscribeMetrics(client: Socket, data: any): void;
    handleUnsubscribeMetrics(client: Socket): void;
    handleRequestCurrentMetrics(client: Socket): void;
    handleGetServerStats(client: Socket): void;
    broadcastMetrics(data: any): void;
    broadcastAlert(alert: any): void;
    broadcastNotification(notification: any): void;
    broadcastPerformanceMetrics(): void;
    getConnectedClientsCount(): number;
    getConnectedClientsInfo(): {
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
    sendToClient(clientId: string, event: string, data: any): boolean;
    cleanup(): void;
}
