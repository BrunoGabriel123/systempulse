import { SystemMetrics } from '../metrics/metrics.service';
import { SystemAlertMessage } from './types/websocket.types';
export interface AlertThreshold {
    metric: string;
    warningThreshold: number;
    criticalThreshold: number;
    enabled: boolean;
}
export declare class AlertsService {
    private logger;
    private defaultThresholds;
    private alertHistory;
    private lastAlerts;
    private alertCooldown;
    checkMetrics(metrics: SystemMetrics): SystemAlertMessage[];
    private checkThreshold;
    private createAlert;
    getAlertHistory(limit?: number): {
        id: string;
        timestamp: Date;
        level: string;
        metric: string;
        value: number;
        message: string;
    }[];
    getThresholds(): AlertThreshold[];
    updateThreshold(metric: string, threshold: Partial<AlertThreshold>): boolean;
    clearCooldowns(): void;
    getStats(): {
        total: number;
        last24h: number;
        byLevel: Record<string, number>;
        byMetric: Record<string, number>;
        lastAlert: {
            timestamp: Date;
            level: string;
            metric: string;
            value: number;
            message: string;
        };
    };
}
