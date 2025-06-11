"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
let MetricsService = class MetricsService {
    constructor() {
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
    (0, common_1.Injectable)()
], MetricsService);
//# sourceMappingURL=metrics.service.js.map