'use client'

import React from 'react'
import { SystemAlert } from '@/hooks/useWebSocket'
import { AlertTriangle, Info, XCircle, AlertCircle, X } from 'lucide-react'

interface AlertsPanelProps {
  alerts: SystemAlert[]
  onClear: () => void
  className?: string
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onClear, className = '' }) => {
  const getAlertIcon = (level: SystemAlert['level']) => {
    switch (level) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getAlertBorderColor = (level: SystemAlert['level']) => {
    switch (level) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR')
  }

  if (alerts.length === 0) {
    return (
      <div className={`metric-card ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alertas do Sistema
          </h3>
        </div>
        <div className="text-center py-8">
          <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Nenhum alerta no momento
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Sistema funcionando normalmente
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`metric-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Alertas do Sistema
          <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
            {alerts.length}
          </span>
        </h3>
        <button
          onClick={onClear}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Limpar alertas"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert, index) => (
          <div
            key={`${alert.timestamp}-${index}`}
            className={`border-l-4 p-3 rounded-r-md ${getAlertBorderColor(alert.level)} transition-all duration-200`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getAlertIcon(alert.level)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {alert.level} Alert
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(alert.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {alert.message}
                </p>
                {alert.metric && (
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>Métrica: {alert.metric}</span>
                    {alert.value !== undefined && (
                      <span>Valor: {alert.value.toFixed(1)}</span>
                    )}
                    {alert.threshold !== undefined && (
                      <span>Limite: {alert.threshold}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={onClear}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Limpar todos os alertas
          </button>
        </div>
      )}
    </div>
  )
}

export default AlertsPanel