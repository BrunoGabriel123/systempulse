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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollectorService = void 0;
const common_1 = require("@nestjs/common");
const metrics_service_1 = require("./metrics.service");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
let MetricsCollectorService = class MetricsCollectorService {
    constructor(metricsService, webSocketGateway) {
        this.metricsService = metricsService;
        this.webSocketGateway = webSocketGateway;
        this.logger = new common_1.Logger('MetricsCollectorService');
        this.isCollecting = false;
    }
    onModuleInit() {
        this.logger.log('Starting metrics collection...');
        this.startCollection();
    }
    onModuleDestroy() {
        this.stopCollection();
    }
    startCollection() {
        if (this.isCollecting) {
            this.logger.warn('Metrics collection already running');
            return;
        }
        this.isCollecting = true;
        this.collectionInterval = setInterval(async () => {
            try {
                const metrics = this.metricsService.getCurrentMetrics();
                await this.metricsService.saveMetrics(metrics);
                this.logger.debug('Metrics collected and saved');
            }
            catch (error) {
                this.logger.error(`Failed to collect metrics: ${error.message}`);
            }
        }, 30000);
        this.broadcastInterval = setInterval(() => {
            try {
                const metrics = this.metricsService.getCurrentMetrics();
                this.webSocketGateway.broadcastMetrics({
                    type: 'metrics_update',
                    data: metrics,
                    timestamp: new Date().toISOString(),
                });
                this.logger.debug('Real-time metrics broadcasted');
            }
            catch (error) {
                this.logger.error(`Failed to broadcast metrics: ${error.message}`);
            }
        }, 2000);
        this.logger.log('Metrics collection started - collecting every 30s, broadcasting every 2s');
    }
    stopCollection() {
        if (!this.isCollecting) {
            return;
        }
        if (this.collectionInterval) {
            clearInterval(this.collectionInterval);
        }
        if (this.broadcastInterval) {
            clearInterval(this.broadcastInterval);
        }
        this.isCollecting = false;
        this.logger.log('Metrics collection stopped');
    }
    async collectNow() {
        const metrics = this.metricsService.getCurrentMetrics();
        await this.metricsService.saveMetrics(metrics);
        this.webSocketGateway.broadcastMetrics({
            type: 'metrics_update',
            data: metrics,
            timestamp: new Date().toISOString(),
        });
        this.logger.log('Manual metrics collection triggered');
    }
    getStatus() {
        return {
            isCollecting: this.isCollecting,
            collectionInterval: 30000,
            broadcastInterval: 2000,
            connectedClients: this.webSocketGateway.getConnectedClientsCount(),
        };
    }
};
exports.MetricsCollectorService = MetricsCollectorService;
exports.MetricsCollectorService = MetricsCollectorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService,
        websocket_gateway_1.WebSocketGateway])
], MetricsCollectorService);
//# sourceMappingURL=metrics-collector.service.js.map