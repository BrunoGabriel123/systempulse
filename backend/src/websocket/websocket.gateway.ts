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
  private lastMetricsBroadcast: any = null;
  private metricsThrottleTime = 1000; // 1 second throttle for metrics

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

    // Send last metrics if available
    if (this.lastMetricsBroadcast) {
      client.emit('metrics_update', this.lastMetricsBroadcast);
    }
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
      serverUptime: process.uptime(),
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
      updateInterval: '2 seconds',
    });

    // Send current metrics immediately if available
    if (this.lastMetricsBroadcast) {
      client.emit('metrics_update', this.lastMetricsBroadcast);
    }
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
    // Send last metrics immediately
    if (this.lastMetricsBroadcast) {
      client.emit('metrics_update', this.lastMetricsBroadcast);
      client.emit('metrics_request_fulfilled', {
        message: 'Current metrics sent',
        timestamp: new Date().toISOString(),
      });
    } else {
      client.emit('metrics_request_fulfilled', {
        message: 'No metrics available yet',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('get_server_stats')
  handleGetServerStats(@ConnectedSocket() client: Socket) {
    const stats = {
      connectedClients: this.connectedClients.size,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString(),
    };
    
    client.emit('server_stats', stats);
  }

  // Optimized method to broadcast metrics with throttling
  broadcastMetrics(data: any) {
    const now = Date.now();
    
    // Store the latest metrics
    this.lastMetricsBroadcast = {
      ...data,
      timestamp: new Date().toISOString(),
      connectedClients: this.connectedClients.size,
      serverUptime: process.uptime(),
    };

    // Broadcast to all clients
    this.server.emit('metrics_update', this.lastMetricsBroadcast);
    
    // Also send to specific subscribers room with additional metadata
    this.server.to('metrics_subscribers').emit('metrics_realtime', {
      ...this.lastMetricsBroadcast,
      subscribersOnly: true,
      broadcastTime: now,
    });
    
    this.logger.debug(`Broadcasted metrics to ${this.connectedClients.size} clients`);
  }

  // Broadcast system alerts with priority
  broadcastAlert(alert: any) {
    const payload = {
      ...alert,
      timestamp: new Date().toISOString(),
      type: 'system_alert',
      priority: alert.data?.level === 'critical' ? 'high' : 'normal',
      connectedClients: this.connectedClients.size,
    };

    // Send to all clients immediately
    this.server.emit('system_alert', payload);
    
    // Also send as high-priority message
    if (payload.priority === 'high') {
      this.server.emit('priority_alert', payload);
    }
    
    this.logger.warn(`Broadcasted ${alert.data?.level || 'unknown'} alert: ${alert.data?.message}`);
  }

  // Broadcast system notifications
  broadcastNotification(notification: any) {
    const payload = {
      ...notification,
      timestamp: new Date().toISOString(),
      type: 'notification',
      connectedClients: this.connectedClients.size,
    };

    this.server.emit('notification', payload);
    this.logger.log(`Broadcasted notification: ${notification.message}`);
  }

  // Broadcast performance metrics
  broadcastPerformanceMetrics() {
    const perfMetrics = {
      type: 'performance_metrics',
      data: {
        connectedClients: this.connectedClients.size,
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        nodeVersion: process.version,
      },
      timestamp: new Date().toISOString(),
    };

    this.server.emit('performance_update', perfMetrics);
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Get connected clients info with enhanced details
  getConnectedClientsInfo() {
    const clients = Array.from(this.connectedClients.entries()).map(([id, socket]) => ({
      id,
      connected: socket.connected,
      rooms: Array.from(socket.rooms),
      handshake: {
        address: socket.handshake.address,
        time: socket.handshake.time,
        headers: {
          'user-agent': socket.handshake.headers['user-agent'],
          'origin': socket.handshake.headers['origin'],
        },
      },
    }));

    return {
      total: this.connectedClients.size,
      subscribersCount: this.server.sockets.adapter.rooms.get('metrics_subscribers')?.size || 0,
      clients,
      serverStats: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        lastBroadcast: this.lastMetricsBroadcast?.timestamp || null,
      },
    };
  }

  // Method to send message to specific client
  sendToClient(clientId: string, event: string, data: any) {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
        targetClient: clientId,
      });
      return true;
    }
    return false;
  }

  // Cleanup method for graceful shutdown
  cleanup() {
    this.logger.log('Cleaning up WebSocket connections...');
    this.connectedClients.clear();
    this.lastMetricsBroadcast = null;
  }
}