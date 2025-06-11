import { Injectable, Logger } from '@nestjs/common';
import { SystemMetrics } from '../metrics/metrics.service';
import { SystemAlertMessage } from './types/websocket.types';

export interface AlertThreshold {
  metric: string;
  warningThreshold: number;
  criticalThreshold: number;
  enabled: boolean;
}

@Injectable()
export class AlertsService {
  private logger = new Logger('AlertsService');
  
  private defaultThresholds: AlertThreshold[] = [
    { metric: 'cpu_usage', warningThreshold: 70, criticalThreshold: 90, enabled: true },
    { metric: 'memory_usage', warningThreshold: 80, criticalThreshold: 95, enabled: true },
    { metric: 'disk_usage', warningThreshold: 85, criticalThreshold: 95, enabled: true },
    { metric: 'load_average', warningThreshold: 2.0, criticalThreshold: 4.0, enabled: true },
  ];

  private alertHistory: Array<{
    timestamp: Date;
    level: string;
    metric: string;
    value: number;
    message: string;
  }> = [];

  private lastAlerts = new Map<string, Date>();
  private alertCooldown = 60000; // 1 minute cooldown

  checkMetrics(metrics: SystemMetrics): SystemAlertMessage[] {
    const alerts: SystemAlertMessage[] = [];

    // Check CPU usage
    const cpuAlert = this.checkThreshold(
      'cpu_usage',
      metrics.cpu.usage,
      'CPU Usage',
      '%'
    );
    if (cpuAlert) alerts.push(cpuAlert);

    // Check Memory usage
    const memoryAlert = this.checkThreshold(
      'memory_usage',
      metrics.memory.usage,
      'Memory Usage',
      '%'
    );
    if (memoryAlert) alerts.push(memoryAlert);

    // Check Disk usage
    const diskAlert = this.checkThreshold(
      'disk_usage',
      metrics.disk.usage,
      'Disk Usage',
      '%'
    );
    if (diskAlert) alerts.push(diskAlert);

    // Check Load Average (1min)
    const loadAlert = this.checkThreshold(
      'load_average',
      metrics.system.loadAverage[0],
      'Load Average (1min)',
      ''
    );
    if (loadAlert) alerts.push(loadAlert);

    // Check for high network usage (above 500 MB/s total)
    const totalNetwork = metrics.network.download + metrics.network.upload;
    if (totalNetwork > 500) {
      const networkAlert = this.createAlert(
        'network_usage',
        totalNetwork,
        'warning',
        `High network usage: ${totalNetwork.toFixed(1)} MB/s`,
        500
      );
      if (networkAlert) alerts.push(networkAlert);
    }

    return alerts;
  }

  private checkThreshold(
    metricName: string,
    value: number,
    displayName: string,
    unit: string
  ): SystemAlertMessage | null {
    const threshold = this.defaultThresholds.find(t => t.metric === metricName);
    if (!threshold || !threshold.enabled) return null;

    let level: 'warning' | 'critical' | null = null;
    let message = '';

    if (value >= threshold.criticalThreshold) {
      level = 'critical';
      message = `🚨 CRITICAL: ${displayName} is at ${value}${unit} (threshold: ${threshold.criticalThreshold}${unit})`;
    } else if (value >= threshold.warningThreshold) {
      level = 'warning';
      message = `⚠️ WARNING: ${displayName} is at ${value}${unit} (threshold: ${threshold.warningThreshold}${unit})`;
    }

    if (level) {
      return this.createAlert(metricName, value, level, message, 
        level === 'critical' ? threshold.criticalThreshold : threshold.warningThreshold);
    }

    return null;
  }

  private createAlert(
    metric: string,
    value: number,
    level: 'warning' | 'critical',
    message: string,
    threshold: number
  ): SystemAlertMessage | null {
    // Check cooldown
    const lastAlert = this.lastAlerts.get(`${metric}_${level}`);
    const now = new Date();
    
    if (lastAlert && (now.getTime() - lastAlert.getTime()) < this.alertCooldown) {
      return null; // Still in cooldown
    }

    // Record alert
    this.lastAlerts.set(`${metric}_${level}`, now);
    this.alertHistory.push({
      timestamp: now,
      level,
      metric,
      value,
      message,
    });

    // Keep only last 100 alerts
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

  // Get alert history
  getAlertHistory(limit: number = 50) {
    return this.alertHistory
      .slice(-limit)
      .reverse()
      .map(alert => ({
        ...alert,
        id: `${alert.metric}_${alert.timestamp.getTime()}`,
      }));
  }

  // Get current thresholds
  getThresholds(): AlertThreshold[] {
    return [...this.defaultThresholds];
  }

  // Update threshold
  updateThreshold(metric: string, threshold: Partial<AlertThreshold>): boolean {
    const index = this.defaultThresholds.findIndex(t => t.metric === metric);
    if (index === -1) return false;

    this.defaultThresholds[index] = {
      ...this.defaultThresholds[index],
      ...threshold,
    };

    this.logger.log(`Updated threshold for ${metric}: ${JSON.stringify(threshold)}`);
    return true;
  }

  // Clear alert cooldowns (for testing)
  clearCooldowns() {
    this.lastAlerts.clear();
    this.logger.log('Alert cooldowns cleared');
  }

  // Get alert statistics
  getStats() {
    const recentAlerts = this.alertHistory.filter(
      alert => Date.now() - alert.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24h
    );

    const byLevel = recentAlerts.reduce((acc, alert) => {
      acc[alert.level] = (acc[alert.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byMetric = recentAlerts.reduce((acc, alert) => {
      acc[alert.metric] = (acc[alert.metric] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.alertHistory.length,
      last24h: recentAlerts.length,
      byLevel,
      byMetric,
      lastAlert: this.alertHistory[this.alertHistory.length - 1] || null,
    };
  }
}