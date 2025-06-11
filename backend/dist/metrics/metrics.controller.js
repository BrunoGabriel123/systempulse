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
exports.MetricsController = void 0;
const common_1 = require("@nestjs/common");
const metrics_service_1 = require("./metrics.service");
const query_metrics_dto_1 = require("./dto/query-metrics.dto");
let MetricsController = class MetricsController {
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    getCurrentMetrics() {
        return this.metricsService.getCurrentMetrics();
    }
    getFormattedMetrics() {
        const metrics = this.metricsService.getCurrentMetrics();
        return {
            ...metrics,
            memory: {
                ...metrics.memory,
                totalFormatted: this.metricsService.formatBytes(metrics.memory.total),
                usedFormatted: this.metricsService.formatBytes(metrics.memory.used),
                freeFormatted: this.metricsService.formatBytes(metrics.memory.free),
            },
            disk: {
                ...metrics.disk,
                totalFormatted: this.metricsService.formatBytes(metrics.disk.total),
                usedFormatted: this.metricsService.formatBytes(metrics.disk.used),
                freeFormatted: this.metricsService.formatBytes(metrics.disk.free),
            },
            system: {
                ...metrics.system,
                uptimeFormatted: this.metricsService.formatUptime(metrics.system.uptime),
            },
        };
    }
    async getMetricsHistory(query) {
        return this.metricsService.getMetrics(query);
    }
    async getLatestMetrics() {
        return this.metricsService.getLatestMetrics();
    }
    async getAggregatedMetrics(metricType = 'all', interval = '1h', startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.metricsService.getAggregatedMetrics(metricType, interval, start, end);
    }
    async getStats() {
        return this.metricsService.getStats();
    }
    async saveCurrentMetrics() {
        const metrics = this.metricsService.getCurrentMetrics();
        return this.metricsService.saveMetrics(metrics);
    }
    async cleanupOldMetrics(days = '30') {
        const olderThanDays = parseInt(days, 10);
        return {
            deleted: await this.metricsService.cleanOldMetrics(olderThanDays),
            message: `Deleted metrics older than ${olderThanDays} days`,
        };
    }
};
exports.MetricsController = MetricsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getCurrentMetrics", null);
__decorate([
    (0, common_1.Get)('formatted'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getFormattedMetrics", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_metrics_dto_1.QueryMetricsDto]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getMetricsHistory", null);
__decorate([
    (0, common_1.Get)('latest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getLatestMetrics", null);
__decorate([
    (0, common_1.Get)('aggregated'),
    __param(0, (0, common_1.Query)('metricType')),
    __param(1, (0, common_1.Query)('interval')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getAggregatedMetrics", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "saveCurrentMetrics", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "cleanupOldMetrics", null);
exports.MetricsController = MetricsController = __decorate([
    (0, common_1.Controller)('metrics'),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], MetricsController);
//# sourceMappingURL=metrics.controller.js.map