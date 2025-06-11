"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let WebSocketGateway = class WebSocketGateway {
    constructor() {
        this.logger = new common_1.Logger('WebSocketGateway');
        this.connectedClients = new Map();
        this.lastMetricsBroadcast = null;
        this.metricsThrottleTime = 1000;
    }
    handleConnection(client) {
        this.connectedClients.set(client.id, client);
        this.logger.log(`Client connected: ${client.id} (Total: ${this.connectedClients.size})`);
        client.emit('connection_established', {
            message: 'Connected to SystemPulse!',
            clientId: client.id,
            timestamp: new Date().toISOString(),
            totalClients: this.connectedClients.size,
        });
        client.emit('server_info', {
            version: '1.0.0',
            uptime: process.uptime(),
            nodeVersion: process.version,
            platform: process.platform,
            timestamp: new Date().toISOString(),
        });
        if (this.lastMetricsBroadcast) {
            client.emit('metrics_update', this.lastMetricsBroadcast);
        }
    }
    handleDisconnect(client) {
        this.connectedClients.delete(client.id);
        this.logger.log(`Client disconnected: ${client.id} (Total: ${this.connectedClients.size})`);
    }
    handlePing(client) {
        client.emit('pong', {
            message: 'pong',
            timestamp: new Date().toISOString(),
            clientId: client.id,
            serverUptime: process.uptime(),
        });
    }
    handleSubscribeMetrics(client, data) {
        this.logger.log(`Client ${client.id} subscribed to metrics`);
        client.join('metrics_subscribers');
        client.emit('subscription_confirmed', {
            type: 'metrics',
            message: 'Successfully subscribed to real-time metrics',
            timestamp: new Date().toISOString(),
            updateInterval: '2 seconds',
        });
        if (this.lastMetricsBroadcast) {
            client.emit('metrics_update', this.lastMetricsBroadcast);
        }
    }
    handleUnsubscribeMetrics(client) {
        this.logger.log(`Client ${client.id} unsubscribed from metrics`);
        client.leave('metrics_subscribers');
        client.emit('subscription_confirmed', {
            type: 'metrics',
            message: 'Successfully unsubscribed from real-time metrics',
            timestamp: new Date().toISOString(),
        });
    }
    handleRequestCurrentMetrics(client) {
        if (this.lastMetricsBroadcast) {
            client.emit('metrics_update', this.lastMetricsBroadcast);
            client.emit('metrics_request_fulfilled', {
                message: 'Current metrics sent',
                timestamp: new Date().toISOString(),
            });
        }
        else {
            client.emit('metrics_request_fulfilled', {
                message: 'No metrics available yet',
                timestamp: new Date().toISOString(),
            });
        }
    }
    handleGetServerStats(client) {
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
    broadcastMetrics(data) {
        const now = Date.now();
        this.lastMetricsBroadcast = {
            ...data,
            timestamp: new Date().toISOString(),
            connectedClients: this.connectedClients.size,
            serverUptime: process.uptime(),
        };
        this.server.emit('metrics_update', this.lastMetricsBroadcast);
        this.server.to('metrics_subscribers').emit('metrics_realtime', {
            ...this.lastMetricsBroadcast,
            subscribersOnly: true,
            broadcastTime: now,
        });
        this.logger.debug(`Broadcasted metrics to ${this.connectedClients.size} clients`);
    }
    broadcastAlert(alert) {
        const payload = {
            ...alert,
            timestamp: new Date().toISOString(),
            type: 'system_alert',
            priority: alert.data?.level === 'critical' ? 'high' : 'normal',
            connectedClients: this.connectedClients.size,
        };
        this.server.emit('system_alert', payload);
        if (payload.priority === 'high') {
            this.server.emit('priority_alert', payload);
        }
        this.logger.warn(`Broadcasted ${alert.data?.level || 'unknown'} alert: ${alert.data?.message}`);
    }
    broadcastNotification(notification) {
        const payload = {
            ...notification,
            timestamp: new Date().toISOString(),
            type: 'notification',
            connectedClients: this.connectedClients.size,
        };
        this.server.emit('notification', payload);
        this.logger.log(`Broadcasted notification: ${notification.message}`);
    }
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
    getConnectedClientsCount() {
        return this.connectedClients.size;
    }
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
    sendToClient(clientId, event, data) {
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
    cleanup() {
        this.logger.log('Cleaning up WebSocket connections...');
        this.connectedClients.clear();
        this.lastMetricsBroadcast = null;
    }
};
exports.WebSocketGateway = WebSocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebSocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], WebSocketGateway.prototype, "handlePing", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe_metrics'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WebSocketGateway.prototype, "handleSubscribeMetrics", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe_metrics'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], WebSocketGateway.prototype, "handleUnsubscribeMetrics", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('request_current_metrics'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], WebSocketGateway.prototype, "handleRequestCurrentMetrics", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_server_stats'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], WebSocketGateway.prototype, "handleGetServerStats", null);
exports.WebSocketGateway = WebSocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
    })
], WebSocketGateway);
//# sourceMappingURL=websocket.gateway.js.map