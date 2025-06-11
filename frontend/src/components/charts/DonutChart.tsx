'use client'

import React from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface DonutChartProps {
  title: string
  value: number
  maxValue: number
  color: string
  unit?: string
  size?: number
}

const DonutChart: React.FC<DonutChartProps> = ({
  title,
  value,
  maxValue,
  color,
  unit = '',
  size = 200,
}) => {
  const percentage = (value / maxValue) * 100
  const remaining = maxValue - value

  const getColor = () => {
    if (percentage >= 90) return '#ef4444' // red-500
    if (percentage >= 80) return '#f59e0b' // amber-500
    if (percentage >= 70) return '#eab308' // yellow-500
    return color
  }

  const data = {
    labels: ['Usado', 'Livre'],
    datasets: [
      {
        data: [value, remaining],
        backgroundColor: [getColor(), '#e5e7eb'], // gray-200
        borderColor: [getColor(), '#d1d5db'], // gray-300
        borderWidth: 2,
        cutout: '70%',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        callbacks: {
          label: function (context: any) {
            const label = context.label || ''
            const value = context.parsed || 0
            return `${label}: ${value.toFixed(1)}${unit}`
          },
        },
      },
    },
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      
      <div className="relative" style={{ width: size, height: size }}>
        <Doughnut data={data} options={options} />
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {percentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {value.toFixed(1)}{unit}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: getColor() }}
          ></div>
          <span className="text-gray-600 dark:text-gray-400">
            Usado: {value.toFixed(1)}{unit}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gray-200"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Livre: {remaining.toFixed(1)}{unit}
          </span>
        </div>
      </div>
    </div>
  )
}

export default DonutChart