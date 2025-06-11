'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

export interface SystemMetrics {
    timestamp: string
    cpu: {
        usage: number
        cores: number
    }
    memory: {
        total: number
        used: number
        free: number
        usage: number
    }
    disk: {
        total: number
        used: number
        free: number
        usage: number
    }
    network: {
        download: number
        upload: number
    }
    system: {
        uptime: number
        loadAverage: number[]
    }
}

export interface SystemAlert {
    level: 'info' | 'warning' | 'error' | 'critical'
    message: string
    metric?: string
    value?: number
    threshold?: number
    timestamp: string
}

export interface WebSocketStatus {
    connected: boolean
    connecting: boolean
    error: string | null
    clientId: string | null
    totalClients: number
    lastPing: Date | null
}

export interface UseWebSocketReturn {
    status: WebSocketStatus
    metrics: SystemMetrics | null
    alerts: SystemAlert[]
    connect: () => void
    disconnect: () => void
    clearAlerts: () => void
    sendMessage: (event: string, data?: any) => void
}

const useWebSocket = (url: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'): UseWebSocketReturn => {
    const socketRef = useRef<Socket | null>(null)
    const [status, setStatus] = useState<WebSocketStatus>({
        connected: false,
        connecting: false,
        error: null,
        clientId: null,
        totalClients: 0,
        lastPing: null,
    })
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
    const [alerts, setAlerts] = useState<SystemAlert[]>([])

    const connect = useCallback(() => {
        if (socketRef.current?.connected) {
            console.log('WebSocket already connected')
            return
        }

        setStatus(prev => ({ ...prev, connecting: true, error: null }))

        const socket = io(url, {
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000,
        })

        // Connection events
        socket.on('connect', () => {
            console.log('✅ WebSocket connected:', socket.id)
            setStatus(prev => ({
                ...prev,
                connected: true,
                connecting: false,
                error: null,
                clientId: socket.id ?? null,
                lastPing: new Date(),
            }))

        })

        socket.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason)
            setStatus(prev => ({
                ...prev,
                connected: false,
                connecting: false,
                error: `Disconnected: ${reason}`,
                clientId: null,
            }))
        })

        socket.on('connect_error', (error) => {
            console.error('🔴 WebSocket connection error:', error)
            setStatus(prev => ({
                ...prev,
                connected: false,
                connecting: false,
                error: error.message || 'Connection failed',
            }))
        })

        // Custom events
        socket.on('connection_established', (data) => {
            console.log('🎉 Connection established:', data)
            setStatus(prev => ({
                ...prev,
                totalClients: data.totalClients || 1,
            }))
        })

        socket.on('server_info', (data) => {
            console.log('ℹ️ Server info:', data)
        })

        // Metrics events
        socket.on('metrics_update', (data) => {
            if (data.data) {
                setMetrics(data.data)
                console.log('📊 Metrics updated:', {
                    cpu: data.data.cpu.usage + '%',
                    memory: data.data.memory.usage + '%',
                    disk: data.data.disk.usage + '%',
                })
            }
        })

        socket.on('metrics_realtime', (data) => {
            if (data.data) {
                setMetrics(data.data)
            }
        })

        // Alert events
        socket.on('system_alert', (data) => {
            const alert: SystemAlert = {
                level: data.data.level,
                message: data.data.message,
                metric: data.data.metric,
                value: data.data.value,
                threshold: data.data.threshold,
                timestamp: data.timestamp,
            }

            console.log(`🚨 ${alert.level.toUpperCase()} Alert:`, alert.message)

            setAlerts(prev => {
                const newAlerts = [alert, ...prev].slice(0, 50) // Keep last 50 alerts
                return newAlerts
            })
        })

        // Notification events
        socket.on('notification', (data) => {
            console.log('🔔 Notification:', data.data.message)
        })

        // Ping/Pong for connection health
        socket.on('pong', (data) => {
            setStatus(prev => ({ ...prev, lastPing: new Date() }))
        })

        socketRef.current = socket
        socket.connect()
    }, [url])

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect()
            socketRef.current = null
        }
        setStatus({
            connected: false,
            connecting: false,
            error: null,
            clientId: null,
            totalClients: 0,
            lastPing: null,
        })
        setMetrics(null)
    }, [])

    const clearAlerts = useCallback(() => {
        setAlerts([])
    }, [])

    const sendMessage = useCallback((event: string, data?: any) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data)
        } else {
            console.warn('Cannot send message: WebSocket not connected')
        }
    }, [])

    // Auto-connect on mount
    useEffect(() => {
        connect()

        // Ping every 30 seconds
        const pingInterval = setInterval(() => {
            if (socketRef.current?.connected) {
                socketRef.current.emit('ping')
            }
        }, 30000)

        return () => {
            clearInterval(pingInterval)
            disconnect()
        }
    }, [connect, disconnect])

    // Subscribe to metrics on connection
    useEffect(() => {
        if (status.connected && socketRef.current) {
            socketRef.current.emit('subscribe_metrics')
        }
    }, [status.connected])

    return {
        status,
        metrics,
        alerts,
        connect,
        disconnect,
        clearAlerts,
        sendMessage,
    }
}

export default useWebSocket