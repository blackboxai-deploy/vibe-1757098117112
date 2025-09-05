'use client'

import { useState, useEffect } from 'react'
import VoiceInterface from '@/components/VoiceInterface'
import TimetablePanel from '@/components/TimetablePanel'
import AlarmPanel from '@/components/AlarmPanel'
import StatusPanel from '@/components/StatusPanel'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function JarvisAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [systemStatus] = useState('Online')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-blue-500/20 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                JARVIS Assistant
              </h1>
              <p className="text-sm text-blue-300">
                {currentTime.toLocaleString()} - Status: {systemStatus}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isListening ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
              }`}></div>
              <span className="text-sm">
                {isListening ? 'Listening...' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Voice Interface - Main Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
              <VoiceInterface 
                isListening={isListening}
                setIsListening={setIsListening}
              />
            </Card>
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            <StatusPanel />
          </div>
        </div>

        {/* Secondary Panels */}
        <div className="mt-8">
          <Tabs defaultValue="timetable" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-blue-500/20">
              <TabsTrigger 
                value="timetable" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Timetable
              </TabsTrigger>
              <TabsTrigger 
                value="alarms"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Alarms
              </TabsTrigger>
            </TabsList>
            <TabsContent value="timetable" className="mt-6">
              <TimetablePanel />
            </TabsContent>
            <TabsContent value="alarms" className="mt-6">
              <AlarmPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}