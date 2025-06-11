export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  clientId?: string;
}

export interface MetricsUpdateMessage extends WebSocketMessage {
  type: 'metrics_update';
  data: {
    timestamp: string;
    cpu: {
      usage: number;
      cores: number;
    };
    memory: {
      total: number;
      used: number;
      free: number;
      usage: number;
    };
    disk: {
      total: number;
      used: number;
      free: number;
      usage: number;
    };
    network: {
      download: number;
      upload: number;
    };
    system: {
      uptime: number;
      loadAverage: number[];
    };
  };
}

export interface SystemAlertMessage extends WebSocketMessage {
  type: 'system_alert';
  data: {
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    metric?: string;
    value?: number;
    threshold?: number;
  };
}

export interface ConnectionMessage extends WebSocketMessage {
  type: 'connection_established' | 'connection_lost';
  data: {
    message: string;
    clientId: string;
    totalClients: number;
  };
}

export interface ServerInfoMessage extends WebSocketMessage {
  type: 'server_info';
  data: {
    version: string;
    uptime: number;
    nodeVersion: string;
    platform: string;
    environment: string;
  };
}

export interface ClientInfo {
  id: string;
  connected: boolean;
  connectedAt: Date;
  lastSeen: Date;
  subscriptions: string[];
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    country?: string;
  };
}