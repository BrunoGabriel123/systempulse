"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
let AlertsService = class AlertsService {
    constructor() {
        this.logger = new common_1.Logger('AlertsService');
        this.defaultThresholds = [
            { metric: 'cpu_usage', warningThreshold: 70, criticalThreshold: 90, enabled: true },
            { metric: 'memory_usage', warningThreshold: 80, criticalThreshold: 95, enabled: true },
            { metric: 'disk_usage', warningThreshold: 85, criticalThreshold: 95, enabled: true },
            { metric: 'load_average', warningThreshold: 2.0, criticalThreshold: 4.0, enabled: true },
        ];
        this.alertHistory = [];
        this.lastAlerts = new Map();
        this.alertCooldown = 60000;
    }
    checkMetrics(metrics) {
        const alerts = [];
        const cpuAlert = this.checkThreshold('cpu_usage', metrics.cpu.usage, 'CPU Usage', '%');
        if (cpuAlert)
            alerts.push(cpuAlert);
        const memoryAlert = this.checkThreshold('memory_usage', metrics.memory.usage, 'Memory Usage', '%');
        if (memoryAlert)
            alerts.push(memoryAlert);
        const diskAlert = this.checkThreshold('disk_usage', metrics.disk.usage, 'Disk Usage', '%');
        if (diskAlert)
            alerts.push(diskAlert);
        const loadAlert = this.checkThreshold('load_average', metrics.system.loadAverage[0], 'Load Average (1min)', '');
        if (loadAlert)
            alerts.push(loadAlert);
        const totalNetwork = metrics.network.download + metrics.network.upload;
        if (totalNetwork > 500) {
            const networkAlert = this.createAlert('network_usage', totalNetwork, 'warning', `High network usage: ${totalNetwork.toFixed(1)} MB/s`, 500);
            if (networkAlert)
                alerts.push(networkAlert);
        }
        return alerts;
    }
    checkThreshold(metricName, value, displayName, unit) {
        const threshold = this.defaultThresholds.find(t => t.metric === metricName);
        if (!threshold || !threshold.enabled)
            return null;
        let level = null;
        let message = '';
        if (value >= threshold.criticalThreshold) {
            level = 'critical';
            message = `🚨 CRITICAL: ${displayName} is at ${value}${unit} (threshold: ${threshold.criticalThreshold}${unit})`;
        }
        else if (value >= threshold.warningThreshold) {
            level = 'warning';
            message = `⚠️ WARNING: ${displayName} is at ${value}${unit} (threshold: ${threshold.warningThreshold}${unit})`;
        }
        if (level) {
            return this.createAlert(metricName, value, level, message, level === 'critical' ? threshold.criticalThreshold : threshold.warningThreshold);
        }
        return null;
    }
    createAlert(metric, value, level, message, threshold) {
        const lastAlert = this.lastAlerts.get(`${metric}_${level}`);
        const now = new Date();
        if (lastAlert && (now.getTime() - lastAlert.getTime()) < this.alertCooldown) {
            return null;
        }
        this.lastAlerts.set(`${metric}_${level}`, now);
        this.alertHistory.push({
            timestamp: now,
            level,
            metric,
            value,
            message,
        });
        if (this.alertHistory.length > 100) {
            this.alertHistory = this.alertHistory.slice(-100);
        }
        this.logger.warn(`${level.toUpperCase()} Alert: ${message}`);
        return {
            type: 'system_alert',
            data: {
                level,
                message,
                metric,
                value,
                threshold,
            },
            timestamp: now.toISOString(),
        };
    }
    getAlertHistory(limit = 50) {
        return this.alertHistory
            .slice(-limit)
            .reverse()
            .map(alert => ({
            ...alert,
            id: `${alert.metric}_${alert.timestamp.getTime()}`,
        }));
    }
    getThresholds() {
        return [...this.defaultThresholds];
    }
    updateThreshold(metric, threshold) {
        const index = this.defaultThresholds.findIndex(t => t.metric === metric);
        if (index === -1)
            return false;
        this.defaultThresholds[index] = {
            ...this.defaultThresholds[index],
            ...threshold,
        };
        this.logger.log(`Updated threshold for ${metric}: ${JSON.stringify(threshold)}`);
        return true;
    }
    clearCooldowns() {
        this.lastAlerts.clear();
        this.logger.log('Alert cooldowns cleared');
    }
    getStats() {
        const recentAlerts = this.alertHistory.filter(alert => Date.now() - alert.timestamp.getTime() < 24 * 60 * 60 * 1000);
        const byLevel = recentAlerts.reduce((acc, alert) => {
            acc[alert.level] = (acc[alert.level] || 0) + 1;
            return acc;
        }, {});
        const byMetric = recentAlerts.reduce((acc, alert) => {
            acc[alert.metric] = (acc[alert.metric] || 0) + 1;
            return acc;
        }, {});
        return {
            total: this.alertHistory.length,
            last24h: recentAlerts.length,
            byLevel,
            byMetric,
            lastAlert: this.alertHistory[this.alertHistory.length - 1] || null,
        };
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)()
], AlertsService);
//# sourceMappingURL=alerts.service.js.map