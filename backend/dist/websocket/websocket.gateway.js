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
        });
    }
    handleSubscribeMetrics(client, data) {
        this.logger.log(`Client ${client.id} subscribed to metrics`);
        client.join('metrics_subscribers');
        client.emit('subscription_confirmed', {
            type: 'metrics',
            message: 'Successfully subscribed to real-time metrics',
            timestamp: new Date().toISOString(),
        });
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
        client.emit('metrics_request_received', {
            message: 'Metrics request received, sending current data...',
            timestamp: new Date().toISOString(),
        });
    }
    broadcastMetrics(data) {
        const payload = {
            ...data,
            timestamp: new Date().toISOString(),
            connectedClients: this.connectedClients.size,
        };
        this.server.emit('metrics_update', payload);
        this.server.to('metrics_subscribers').emit('metrics_realtime', payload);
        this.logger.debug(`Broadcasted metrics to ${this.connectedClients.size} clients`);
    }
    broadcastAlert(alert) {
        const payload = {
            ...alert,
            timestamp: new Date().toISOString(),
            type: 'system_alert',
        };
        this.server.emit('system_alert', payload);
        this.logger.warn(`Broadcasted alert: ${alert.message}`);
    }
    broadcastNotification(notification) {
        const payload = {
            ...notification,
            timestamp: new Date().toISOString(),
            type: 'notification',
        };
        this.server.emit('notification', payload);
        this.logger.log(`Broadcasted notification: ${notification.message}`);
    }
    getConnectedClientsCount() {
        return this.connectedClients.size;
    }
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
exports.WebSocketGateway = WebSocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
    })
], WebSocketGateway);
//# sourceMappingURL=websocket.gateway.js.map