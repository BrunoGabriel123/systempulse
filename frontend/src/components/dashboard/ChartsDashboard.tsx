'use client'

import React from 'react'
import { SystemMetrics } from '@/hooks/useWebSocket'
import RealtimeChart from '@/components/charts/RealtimeChart'
import DonutChart from '@/components/charts/DonutChart'
import { formatBytes } from '@/lib/utils'

interface ChartsDashboardProps {
  metrics: SystemMetrics | null
  metricsHistory: SystemMetrics[]
  className?: string
}

const ChartsDashboard: React.FC<ChartsDashboardProps> = ({
  metrics,
  metricsHistory,
  className = '',
}) => {
  if (!metrics && metricsHistory.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mx-auto"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Aguardando dados para exibir gráficos...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Real-time Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Usage Chart */}
        <div className="metric-card">
          <RealtimeChart
            title="Uso da CPU"
            metrics={metricsHistory}
            dataKey="cpu.usage"
            color="#3b82f6" // blue-500
            unit="%"
            maxValue={100}
            height={250}
          />
        </div>

        {/* Memory Usage Chart */}
        <div className="metric-card">
          <RealtimeChart
            title="Uso da Memória"
            metrics={metricsHistory}
            dataKey="memory.usage"
            color="#10b981" // emerald-500
            unit="%"
            maxValue={100}
            height={250}
          />
        </div>
      </div>

      {/* Network Traffic Chart */}
      <div className="metric-card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tráfego de Rede
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Download e Upload em tempo real
          </p>
        </div>
        
        <div style={{ height: '300px' }}>
          {metricsHistory.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              <div className="chart-container">
                <RealtimeChart
                  title="Download"
                  metrics={metricsHistory}
                  dataKey="network.download"
                  color="#8b5cf6" // violet-500
                  unit=" MB/s"
                  maxValue={100}
                  height={250}
                />
              </div>
              <div className="chart-container">
                <RealtimeChart
                  title="Upload"
                  metrics={metricsHistory}
                  dataKey="network.upload"
                  color="#f59e0b" // amber-500
                  unit=" MB/s"
                  maxValue={50}
                  height={250}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Donut Charts for Storage */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Memory Donut */}
          <div className="metric-card">
            <DonutChart
              title="Memória RAM"
              value={metrics.memory.used / (1024 * 1024 * 1024)} // Convert to GB
              maxValue={metrics.memory.total / (1024 * 1024 * 1024)} // Convert to GB
              color="#10b981" // emerald-500
              unit=" GB"
              size={180}
            />
          </div>

          {/* Disk Donut */}
          <div className="metric-card">
            <DonutChart
              title="Armazenamento"
              value={metrics.disk.used / (1024 * 1024 * 1024)} // Convert to GB
              maxValue={metrics.disk.total / (1024 * 1024 * 1024)} // Convert to GB
              color="#3b82f6" // blue-500
              unit=" GB"
              size={180}
            />
          </div>

          {/* CPU Donut */}
          <div className="metric-card">
            <DonutChart
              title="CPU Usage"
              value={metrics.cpu.usage}
              maxValue={100}
              color="#f59e0b" // amber-500
              unit="%"
              size={180}
            />
          </div>
        </div>
      )}

      {/* Load Average Chart */}
      {metricsHistory.length > 0 && (
        <div className="metric-card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Load Average
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Carga média do sistema (1min, 5min, 15min)
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="chart-container">
              <RealtimeChart
                title="1 Minuto"
                metrics={metricsHistory}
                dataKey="system.loadAverage.0"
                color="#ef4444" // red-500
                unit=""
                maxValue={4}
                height={200}
              />
            </div>
            <div className="chart-container">
              <RealtimeChart
                title="5 Minutos"
                metrics={metricsHistory}
                dataKey="system.loadAverage.1"
                color="#f59e0b" // amber-500
                unit=""
                maxValue={4}
                height={200}
              />
            </div>
            <div className="chart-container">
              <RealtimeChart
                title="15 Minutos"
                metrics={metricsHistory}
                dataKey="system.loadAverage.2"
                color="#10b981" // emerald-500
                unit=""
                maxValue={4}
                height={200}
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {metrics && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Resumo Atual
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {metrics.cpu.usage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">CPU</div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {metrics.memory.usage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Memória</div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {metrics.disk.usage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Disco</div>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {(metrics.network.download + metrics.network.upload).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">MB/s Rede</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChartsDashboard