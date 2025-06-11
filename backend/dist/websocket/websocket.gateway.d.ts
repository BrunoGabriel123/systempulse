import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    private connectedClients;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handlePing(client: Socket): void;
    handleSubscribeMetrics(client: Socket, data: any): void;
    handleUnsubscribeMetrics(client: Socket): void;
    handleRequestCurrentMetrics(client: Socket): void;
    broadcastMetrics(data: any): void;
    broadcastAlert(alert: any): void;
    broadcastNotification(notification: any): void;
    getConnectedClientsCount(): number;
    getConnectedClientsInfo(): {
        total: number;
        clients: {
            id: string;
            connected: boolean;
            handshake: {
                address: string;
                time: string;
                headers: {
                    'user-agent': string;
                };
            };
        }[];
    };
}
