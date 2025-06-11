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
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const metrics_repository_1 = require("./metrics.repository");
let MetricsService = class MetricsService {
    constructor(metricsRepository) {
        this.metricsRepository = metricsRepository;
        this.logger = new common_1.Logger('MetricsService');
    }
    generateMockMetrics() {
        const timestamp = new Date().toISOString();
        const cpuUsage = Math.random() * 100;
        const memoryTotal = 16 * 1024 * 1024 * 1024;
        const memoryUsed = memoryTotal * (0.3 + Math.random() * 0.4);
        const diskTotal = 500 * 1024 * 1024 * 1024;
        const diskUsed = diskTotal * (0.2 + Math.random() * 0.6);
        return {
            timestamp,
            cpu: {
                usage: Number(cpuUsage.toFixed(1)),
                cores: 8,
            },
            memory: {
                total: memoryTotal,
                used: memoryUsed,
                free: memoryTotal - memoryUsed,
                usage: Number(((memoryUsed / memoryTotal) * 100).toFixed(1)),
            },
            disk: {
                total: diskTotal,
                used: diskUsed,
                free: diskTotal - diskUsed,
                usage: Number(((diskUsed / diskTotal) * 100).toFixed(1)),
            },
            network: {
                download: Number((Math.random() * 100).toFixed(1)),
                upload: Number((Math.random() * 50).toFixed(1)),
            },
            system: {
                uptime: Math.floor(Math.random() * 86400),
                loadAverage: [
                    Number((Math.random() * 2).toFixed(2)),
                    Number((Math.random() * 2).toFixed(2)),
                    Number((Math.random() * 2).toFixed(2)),
                ],
            },
        };
    }
    getCurrentMetrics() {
        const metrics = this.generateMockMetrics();
        this.logger.debug(`Generated metrics: CPU ${metrics.cpu.usage}%, Memory ${metrics.memory.usage}%`);
        return metrics;
    }
    async saveMetrics(systemMetrics) {
        const timestamp = new Date(systemMetrics.timestamp);
        const savedMetrics = [];
        try {
            const cpuMetric = await this.metricsRepository.save({
                timestamp,
                metricType: 'cpu',
                cpuUsage: systemMetrics.cpu.usage,
                cpuCores: systemMetrics.cpu.cores,
                loadAvg1: systemMetrics.system.loadAverage[0],
                loadAvg5: systemMetrics.system.loadAverage[1],
                loadAvg15: systemMetrics.system.loadAverage[2],
            });
            savedMetrics.push(cpuMetric);
            const memoryMetric = await this.metricsRepository.save({
                timestamp,
                metricType: 'memory',
                memoryTotal: systemMetrics.memory.total,
                memoryUsed: systemMetrics.memory.used,
                memoryFree: systemMetrics.memory.free,
                memoryUsage: systemMetrics.memory.usage,
            });
            savedMetrics.push(memoryMetric);
            const diskMetric = await this.metricsRepository.save({
                timestamp,
                metricType: 'disk',
                diskTotal: systemMetrics.disk.total,
                diskUsed: systemMetrics.disk.used,
                diskFree: systemMetrics.disk.free,
                diskUsage: systemMetrics.disk.usage,
            });
            savedMetrics.push(diskMetric);
            const networkMetric = await this.metricsRepository.save({
                timestamp,
                metricType: 'network',
                networkDownload: systemMetrics.network.download,
                networkUpload: systemMetrics.network.upload,
            });
            savedMetrics.push(networkMetric);
            const systemMetric = await this.metricsRepository.save({
                timestamp,
                metricType: 'system',
                uptime: systemMetrics.system.uptime,
            });
            savedMetrics.push(systemMetric);
            this.logger.log(`Saved ${savedMetrics.length} metrics to database`);
            return savedMetrics;
        }
        catch (error) {
            this.logger.error(`Failed to save metrics: ${error.message}`);
            throw error;
        }
    }
    async getMetrics(query) {
        return this.metricsRepository.findWithFilters(query);
    }
    async getLatestMetrics() {
        return this.metricsRepository.getLatestMetrics();
    }
    async getAggregatedMetrics(metricType, interval, startDate, endDate) {
        return this.metricsRepository.getAggregatedMetrics(metricType, interval, startDate, endDate);
    }
    async cleanOldMetrics(olderThanDays = 30) {
        const deleted = await this.metricsRepository.deleteOldMetrics(olderThanDays);
        this.logger.log(`Deleted ${deleted} old metrics`);
        return deleted;
    }
    async getStats() {
        return this.metricsRepository.getMetricsStats();
    }
    formatBytes(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0)
            return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (days > 0)
            return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0)
            return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_repository_1.MetricsRepository])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map