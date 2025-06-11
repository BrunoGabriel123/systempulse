import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WSGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WebSocketGateway');
  private connectedClients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    this.logger.log(`Client connected: ${client.id} (Total: ${this.connectedClients.size})`);
    
    // Send welcome message with current status
    client.emit('connection_established', {
      message: 'Connected to SystemPulse!',
      clientId: client.id,
      timestamp: new Date().toISOString(),
      totalClients: this.connectedClients.size,
    });

    // Send server info
    client.emit('server_info', {
      version: '1.0.0',
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', {
      message: 'pong',
      timestamp: new Date().toISOString(),
      clientId: client.id,
    });
  }

  @SubscribeMessage('subscribe_metrics')
  handleSubscribeMetrics(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    this.logger.log(`Client ${client.id} subscribed to metrics`);
    client.join('metrics_subscribers');
    
    client.emit('subscription_confirmed', {
      type: 'metrics',
      message: 'Successfully subscribed to real-time metrics',
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('unsubscribe_metrics')
  handleUnsubscribeMetrics(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} unsubscribed from metrics`);
    client.leave('metrics_subscribers');
    
    client.emit('subscription_confirmed', {
      type: 'metrics',
      message: 'Successfully unsubscribed from real-time metrics',
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('request_current_metrics')
  handleRequestCurrentMetrics(@ConnectedSocket() client: Socket) {
    // This will be handled by the MetricsCollectorService
    client.emit('metrics_request_received', {
      message: 'Metrics request received, sending current data...',
      timestamp: new Date().toISOString(),
    });
  }

  // Method to broadcast metrics to all connected clients
  broadcastMetrics(data: any) {
    const payload = {
      ...data,
      timestamp: new Date().toISOString(),
      connectedClients: this.connectedClients.size,
    };

    // Broadcast to all clients
    this.server.emit('metrics_update', payload);
    
    // Also send to specific subscribers room
    this.server.to('metrics_subscribers').emit('metrics_realtime', payload);
    
    this.logger.debug(`Broadcasted metrics to ${this.connectedClients.size} clients`);
  }

  // Broadcast system alerts
  broadcastAlert(alert: any) {
    const payload = {
      ...alert,
      timestamp: new Date().toISOString(),
      type: 'system_alert',
    };

    this.server.emit('system_alert', payload);
    this.logger.warn(`Broadcasted alert: ${alert.message}`);
  }

  // Broadcast system notifications
  broadcastNotification(notification: any) {
    const payload = {
      ...notification,
      timestamp: new Date().toISOString(),
      type: 'notification',
    };

    this.server.emit('notification', payload);
    this.logger.log(`Broadcasted notification: ${notification.message}`);
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Get connected clients info
  getConnectedClientsInfo() {
    const clients = Array.from(this.connectedClients.entries()).map(([id, socket]) => ({
      id,
      connected: socket.connected,
      handshake: {
        address: socket.handshake.address,
        time: socket.handshake.time,
        headers: {
          'user-agent': socket.handshake.headers['user-agent'],
        },
      },
    }));

    return {
      total: this.connectedClients.size,
      clients,
    };
  }
}