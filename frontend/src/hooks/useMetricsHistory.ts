'use client'

import { useState, useEffect, useCallback } from 'react'
import { SystemMetrics } from './useWebSocket'

interface MetricsHistoryOptions {
  maxHistory?: number
  updateInterval?: number
}

export interface MetricsHistory {
  history: SystemMetrics[]
  addMetric: (metric: SystemMetrics) => void
  clearHistory: () => void
  getLatestMetric: () => SystemMetrics | null
  getMetricTrend: (key: string, periods?: number) => 'up' | 'down' | 'stable'
  getAverageValue: (key: string, periods?: number) => number
}

const useMetricsHistory = (
  currentMetric: SystemMetrics | null,
  options: MetricsHistoryOptions = {}
): MetricsHistory => {
  const { maxHistory = 50, updateInterval = 2000 } = options
  const [history, setHistory] = useState<SystemMetrics[]>([])

  // Add new metric to history
  const addMetric = useCallback((metric: SystemMetrics) => {
    setHistory(prev => {
      const newHistory = [...prev, metric]
      // Keep only the last maxHistory items
      return newHistory.slice(-maxHistory)
    })
  }, [maxHistory])

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  // Get the latest metric
  const getLatestMetric = useCallback((): SystemMetrics | null => {
    return history.length > 0 ? history[history.length - 1] : null
  }, [history])

  // Get value from nested object using dot notation
  const getValue = useCallback((metric: SystemMetrics, key: string): number => {
    const keys = key.split('.')
    let value: any = metric
    for (const k of keys) {
      value = value?.[k]
    }
    return typeof value === 'number' ? value : 0
  }, [])

  // Calculate trend for a specific metric
  const getMetricTrend = useCallback((key: string, periods: number = 5): 'up' | 'down' | 'stable' => {
    if (history.length < periods) return 'stable'

    const recentMetrics = history.slice(-periods)
    const values = recentMetrics.map(metric => getValue(metric, key))
    
    if (values.length < 2) return 'stable'

    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

    const difference = secondAvg - firstAvg
    const threshold = 0.5 // Minimum change to consider as trend

    if (Math.abs(difference) < threshold) return 'stable'
    return difference > 0 ? 'up' : 'down'
  }, [history, getValue])

  // Calculate average value for a specific metric
  const getAverageValue = useCallback((key: string, periods: number = 10): number => {
    if (history.length === 0) return 0

    const recentMetrics = history.slice(-periods)
    const values = recentMetrics.map(metric => getValue(metric, key))
    
    if (values.length === 0) return 0
    
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }, [history, getValue])

  // Auto-add current metric to history
  useEffect(() => {
    if (currentMetric) {
      addMetric(currentMetric)
    }
  }, [currentMetric, addMetric])

  // Optional: Auto-cleanup old data
  useEffect(() => {
    const cleanup = setInterval(() => {
      setHistory(prev => {
        if (prev.length > maxHistory) {
          return prev.slice(-maxHistory)
        }
        return prev
      })
    }, updateInterval * 10) // Cleanup every 20 seconds

    return () => clearInterval(cleanup)
  }, [maxHistory, updateInterval])

  return {
    history,
    addMetric,
    clearHistory,
    getLatestMetric,
    getMetricTrend,
    getAverageValue,
  }
}

export default useMetricsHistory