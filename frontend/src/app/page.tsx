'use client'

import { useState, useEffect } from 'react'
import { Activity, Server, Wifi, Cpu, HardDrive, MemoryStick, Network, Clock } from 'lucide-react'
import useWebSocket from '@/hooks/useWebSocket'
import MetricCard from '@/components/dashboard/MetricCard'
import AlertsPanel from '@/components/dashboard/AlertsPanel'
import { formatBytes, formatUptime, getStatusColor } from '@/lib/utils'

export default function Home() {
  const { status, metrics, alerts, clearAlerts, sendMessage } = useWebSocket()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getConnectionStatusColor = () => {
    if (status.connected) return 'status-online'
    if (status.connecting) return 'status-warning'
    return 'status-critical'
  }

  const getConnectionStatusText = () => {
    if (status.connected) return '✓ Conectado'
    if (status.connecting) return '⏳ Conectando...'
    return '❌ Desconectado'
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  SystemPulse
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Monitor de Sistema em Tempo Real
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {currentTime.toLocaleString('pt-BR')}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${
                  status.connected ? 'bg-green-500' : 
                  status.connecting ? 'bg-yellow-500 animate-pulse' : 
                  'bg-red-500'
                }`} />
                <span className={`text-sm font-medium ${getConnectionStatusColor()}`}>
                  {getConnectionStatusText()}
                </span>
                {status.totalClients > 0 && (
                  <span className="text-xs text-gray-500">
                    ({status.totalClients} cliente{status.totalClients !== 1 ? 's' : ''})
                  </span>
                )}
              </div>
              {status.error && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {status.error}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Connection Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Backend Status"
            value="Operacional"
            icon={Server}
            color="green"
            subtitle="API funcionando"
          />

          <MetricCard
            title="WebSocket"
            value={status.connected ? 'Conectado' : status.connecting ? 'Conectando' : 'Desconectado'}
            icon={Wifi}
            color={status.connected ? 'green' : status.connecting ? 'yellow' : 'red'}
            subtitle={status.clientId ? `ID: ${status.clientId.substring(0, 8)}` : 'Aguardando conexão'}
            isLoading={status.connecting}
          />

          <MetricCard
            title="Alertas Ativos"
            value={alerts.length}
            icon={Activity}
            color={alerts.length > 0 ? 'red' : 'green'}
            subtitle={alerts.length > 0 ? 'Verificar alertas' : 'Sistema normal'}
          />
        </div>

        {/* System Metrics */}
        {metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="CPU"
              value={metrics.cpu.usage}
              unit="%"
              percentage={metrics.cpu.usage}
              icon={Cpu}
              color={getStatusColor(metrics.cpu.usage)}
              subtitle={`${metrics.cpu.cores} cores`}
            />

            <MetricCard
              title="Memória"
              value={formatBytes(metrics.memory.used)}
              percentage={metrics.memory.usage}
              icon={MemoryStick}
              color={getStatusColor(metrics.memory.usage)}
              subtitle={`Total: ${formatBytes(metrics.memory.total)}`}
            />

            <MetricCard
              title="Disco"
              value={formatBytes(metrics.disk.used)}
              percentage={metrics.disk.usage}
              icon={HardDrive}
              color={getStatusColor(metrics.disk.usage)}
              subtitle={`Livre: ${formatBytes(metrics.disk.free)}`}
            />

            <MetricCard
              title="Rede"
              value={metrics.network.download + metrics.network.upload}
              unit="MB/s"
              icon={Network}
              color="blue"
              subtitle={`↓${metrics.network.download.toFixed(1)} ↑${metrics.network.upload.toFixed(1)} MB/s`}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <MetricCard
                key={i}
                title="Carregando..."
                value="--"
                icon={Activity}
                color="blue"
                isLoading={true}
              />
            ))}
          </div>
        )}

        {/* System Info & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Information */}
          <div className="metric-card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Informações do Sistema
            </h2>
            {metrics ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Uptime</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatUptime(metrics.system.uptime)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Load Average</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {metrics.system.loadAverage.map(load => load.toFixed(2)).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Network className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Tráfego de Rede</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Download: {metrics.network.download.toFixed(1)} MB/s<br />
                      Upload: {metrics.network.upload.toFixed(1)} MB/s
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Última atualização: {new Date(metrics.timestamp).toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-600 dark:text-gray-400">
                  Aguardando dados do sistema...
                </p>
              </div>
            )}
          </div>

          {/* Alerts Panel */}
          <AlertsPanel alerts={alerts} onClear={clearAlerts} />
        </div>

        {/* Debug Panel (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 metric-card border-dashed border-gray-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Debug Panel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => sendMessage('ping')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Ping Server
              </button>
              <button
                onClick={() => sendMessage('request_current_metrics')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Request Metrics
              </button>
              <button
                onClick={clearAlerts}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Clear Alerts
              </button>
            </div>
            <div className="mt-4 text-xs">
              <div>Connected: {status.connected ? 'Yes' : 'No'}</div>
              <div>Client ID: {status.clientId || 'None'}</div>
              <div>Total Clients: {status.totalClients}</div>
              <div>Last Ping: {status.lastPing?.toLocaleTimeString() || 'Never'}</div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}