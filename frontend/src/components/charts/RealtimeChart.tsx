'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { SystemMetrics } from '@/hooks/useWebSocket'
import { ChartData } from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface RealtimeChartProps {
  title: string
  metrics: SystemMetrics[]
  dataKey: string
  color: string
  unit?: string
  maxValue?: number
  height?: number
}

const RealtimeChart: React.FC<RealtimeChartProps> = ({
  title,
  metrics,
  dataKey,
  color,
  unit = '',
  maxValue = 100,
  height = 300,
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null)
 const [chartData, setChartData] = useState<ChartData<'line'>>({
  labels: [],
  datasets: [
    {
      label: title,
      data: [],
      borderColor: color,
      backgroundColor: `${color}20`,
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
    },
  ],
})

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // Disable animations for smooth real-time updates
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: color,
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            return `${title}: ${context.parsed.y.toFixed(1)}${unit}`
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          maxTicksLimit: 10,
          color: '#6b7280',
        },
      },
      y: {
        display: true,
        min: 0,
        max: maxValue,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          callback: function (value: any) {
            return `${value}${unit}`
          },
        },
      },
    },
  }

  useEffect(() => {
    if (metrics.length === 0) return

    // Keep only last 30 data points for performance
    const maxDataPoints = 30
    const recentMetrics = metrics.slice(-maxDataPoints)

    // Extract value from nested object using dataKey
    const getValue = (metric: SystemMetrics, key: string): number => {
      const keys = key.split('.')
      let value: any = metric
      for (const k of keys) {
        value = value?.[k]
      }
      return typeof value === 'number' ? value : 0
    }

    const labels = recentMetrics.map((_, index) => {
      const now = new Date()
      const time = new Date(now.getTime() - (recentMetrics.length - 1 - index) * 2000) // 2 second intervals
      return time.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    })

    const data = recentMetrics.map(metric => getValue(metric, dataKey))

    setChartData({
      labels,
      datasets: [
        {
          ...chartData.datasets[0],
          data,
        },
      ],
    })
  }, [metrics, dataKey])

  return (
    <div className="chart-container" style={{ height: `${height}px` }}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Últimos 60 segundos
        </p>
      </div>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  )
}

export default RealtimeChart