'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  percentage?: number
  icon: LucideIcon
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
  isLoading?: boolean
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-900 dark:text-blue-100',
    progress: 'bg-blue-600',
    border: 'border-blue-200 dark:border-blue-800',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-900 dark:text-green-100',
    progress: 'bg-green-600',
    border: 'border-green-200 dark:border-green-800',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: 'text-yellow-600 dark:text-yellow-400',
    text: 'text-yellow-900 dark:text-yellow-100',
    progress: 'bg-yellow-600',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-red-900 dark:text-red-100',
    progress: 'bg-red-600',
    border: 'border-red-200 dark:border-red-800',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    text: 'text-purple-900 dark:text-purple-100',
    progress: 'bg-purple-600',
    border: 'border-purple-200 dark:border-purple-800',
  },
}

export default function MetricCard({
  title,
  value,
  unit = '',
  percentage,
  icon: Icon,
  color,
  subtitle,
  trend,
  isLoading = false,
}: MetricCardProps) {
  const colors = colorClasses[color]

  const getProgressColor = () => {
    if (percentage === undefined) return colors.progress
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return colors.progress
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗️'
      case 'down':
        return '↘️'
      case 'stable':
        return '→'
      default:
        return ''
    }
  }

  return (
    <div className={`metric-card ${colors.bg} ${colors.border} border transition-all duration-200 hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-2 rounded-lg ${colors.bg}`}>
              <Icon className={`h-6 w-6 ${colors.icon}`} />
            </div>
            <div>
              <h3 className={`font-semibold ${colors.text}`}>{title}</h3>
              {subtitle && (
                <p className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-end space-x-2">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
              ) : (
                <>
                  <span className={`text-2xl font-bold ${colors.text}`}>
                    {typeof value === 'number' ? value.toFixed(1) : value}
                  </span>
                  {unit && (
                    <span className={`text-sm font-medium ${colors.text} opacity-75`}>
                      {unit}
                    </span>
                  )}
                  {trend && (
                    <span className="text-sm ml-2">{getTrendIcon()}</span>
                  )}
                </>
              )}
            </div>

            {percentage !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Usage</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>
    </div>
  )
}