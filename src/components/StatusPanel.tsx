'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface SystemStatus {
  aiConnection: 'connected' | 'disconnected' | 'error'
  voiceRecognition: 'supported' | 'unsupported'
  speechSynthesis: 'supported' | 'unsupported'
  lastUpdate: Date
}

export default function StatusPanel() {
  const [status, setStatus] = useState<SystemStatus>({
    aiConnection: 'connected',
    voiceRecognition: 'supported',
    speechSynthesis: 'supported',
    lastUpdate: new Date()
  })
  const [uptime, setUptime] = useState(0)

  useEffect(() => {
    // Check browser capabilities
    const voiceSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    const speechSupported = 'speechSynthesis' in window

    setStatus(prev => ({
      ...prev,
      voiceRecognition: voiceSupported ? 'supported' : 'unsupported',
      speechSynthesis: speechSupported ? 'supported' : 'unsupported'
    }))

    // Update uptime every second
    const startTime = Date.now()
    const uptimeTimer = setInterval(() => {
      setUptime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    // Update status every 30 seconds
    const statusTimer = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        lastUpdate: new Date()
      }))
    }, 30000)

    return () => {
      clearInterval(uptimeTimer)
      clearInterval(statusTimer)
    }
  }, [])

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case 'connected':
      case 'supported':
        return 'bg-green-500'
      case 'disconnected':
      case 'unsupported':
        return 'bg-red-500'
      case 'error':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (statusType: string) => {
    switch (statusType) {
      case 'connected':
        return 'Online'
      case 'disconnected':
        return 'Offline'
      case 'error':
        return 'Error'
      case 'supported':
        return 'Available'
      case 'unsupported':
        return 'Not Available'
      default:
        return 'Unknown'
    }
  }

  return (
    <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          System Status
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* AI Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-100">AI Connection</span>
          <Badge variant="secondary" className="bg-slate-700 text-blue-100">
            <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(status.aiConnection)}`}></div>
            {getStatusText(status.aiConnection)}
          </Badge>
        </div>

        {/* Voice Recognition */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-100">Voice Recognition</span>
          <Badge variant="secondary" className="bg-slate-700 text-blue-100">
            <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(status.voiceRecognition)}`}></div>
            {getStatusText(status.voiceRecognition)}
          </Badge>
        </div>

        {/* Speech Synthesis */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-100">Speech Synthesis</span>
          <Badge variant="secondary" className="bg-slate-700 text-blue-100">
            <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(status.speechSynthesis)}`}></div>
            {getStatusText(status.speechSynthesis)}
          </Badge>
        </div>

        <Separator className="bg-blue-500/20" />

        {/* System Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-100">Uptime</span>
            <span className="text-sm font-mono text-blue-300">{formatUptime(uptime)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-100">Last Update</span>
            <span className="text-sm font-mono text-blue-300">
              {status.lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-blue-500/10">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">JARVIS</div>
            <div className="text-xs text-blue-300">Just A Rather Very Intelligent System</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}