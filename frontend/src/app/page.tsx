'use client'

import { useState, useEffect } from 'react'
import { Activity, Server, Wifi } from 'lucide-react'

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simulate connection (we'll implement real WebSocket in next commit)
    const connectTimer = setTimeout(() => {
      setConnectionStatus('connected')
    }, 2000)

    return () => {
      clearInterval(timer)
      clearTimeout(connectTimer)
    }
  }, [])

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
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                  'bg-red-500'
                }`} />
                <span className="text-sm font-medium">
                  {connectionStatus === 'connected' ? 'Conectado' : 
                   connectionStatus === 'connecting' ? 'Conectando...' : 
                   'Desconectado'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="metric-card">
            <div className="flex items-center space-x-3">
              <Server className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Backend Status
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ Operacional
                </p>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center space-x-3">
              <Wifi className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  WebSocket
                </h3>
                <p className={`text-sm ${
                  connectionStatus === 'connected' ? 'text-green-600 dark:text-green-400' : 
                  'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {connectionStatus === 'connected' ? '✓ Conectado' : '⏳ Conectando...'}
                </p>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Sistema
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  📊 Monitorando
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="metric-card text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Bem-vindo ao SystemPulse! 🚀
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Seu dashboard de monitoramento de sistema está configurado e pronto para uso.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                ✅ Configurado
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Next.js 14 com TypeScript</li>
                <li>• Tailwind CSS para styling</li>
                <li>• Layout responsivo</li>
                <li>• Tema escuro/claro</li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                🔄 Próximos Passos
              </h3>
              <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                <li>• Conectar WebSocket</li>
                <li>• Exibir métricas em tempo real</li>
                <li>• Adicionar gráficos interativos</li>
                <li>• Sistema de alertas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}