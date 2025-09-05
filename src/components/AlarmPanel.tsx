'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'


interface Alarm {
  id: string
  time: string
  label: string
  enabled: boolean
  recurring: boolean
  sound: boolean
}

export default function AlarmPanel() {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [isAddingAlarm, setIsAddingAlarm] = useState(false)
  const [newAlarm, setNewAlarm] = useState({
    time: '',
    label: '',
    recurring: false,
    sound: true
  })
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      checkAlarms()
    }, 1000)

    return () => clearInterval(timer)
  }, [alarms])

  // Load alarms from localStorage
  useEffect(() => {
    const savedAlarms = localStorage.getItem('jarvis-alarms')
    if (savedAlarms) {
      setAlarms(JSON.parse(savedAlarms))
    } else {
      // Set default morning alarm
      const defaultAlarm: Alarm = {
        id: Date.now().toString(),
        time: '07:00',
        label: 'Good morning wake-up call',
        enabled: true,
        recurring: true,
        sound: true
      }
      setAlarms([defaultAlarm])
    }
  }, [])

  // Save alarms to localStorage
  useEffect(() => {
    localStorage.setItem('jarvis-alarms', JSON.stringify(alarms))
  }, [alarms])

  const checkAlarms = () => {
    const now = new Date()
    const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    alarms.forEach(alarm => {
      if (alarm.enabled && alarm.time === currentTimeString && now.getSeconds() === 0) {
        triggerAlarm(alarm)
      }
    })
  }

  const triggerAlarm = (alarm: Alarm) => {
    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('JARVIS Alarm', {
        body: alarm.label || 'Alarm triggered!',
        icon: '/favicon.ico'
      })
    }

    // Play alarm sound (if enabled and supported)
    if (alarm.sound && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Boss, this is your alarm. ${alarm.label || 'Time to wake up!'}`
      )
      utterance.rate = 0.9
      utterance.pitch = 1.1
      speechSynthesis.speak(utterance)
    }

    // Alert fallback
    alert(`🚨 JARVIS ALARM 🚨\n\n${alarm.label || 'Alarm triggered!'}`)
  }

  const addAlarm = () => {
    if (newAlarm.time) {
      const alarm: Alarm = {
        id: Date.now().toString(),
        time: newAlarm.time,
        label: newAlarm.label || 'Alarm',
        enabled: true,
        recurring: newAlarm.recurring,
        sound: newAlarm.sound
      }
      
      setAlarms(prev => [...prev, alarm])
      setNewAlarm({ time: '', label: '', recurring: false, sound: true })
      setIsAddingAlarm(false)
    }
  }

  const removeAlarm = (id: string) => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== id))
  }

  const toggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ))
  }



  const getNextAlarm = () => {
    const enabledAlarms = alarms.filter(alarm => alarm.enabled)
    if (enabledAlarms.length === 0) return null

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    
    // Find next alarm today
    let nextAlarm = enabledAlarms
      .map(alarm => {
        const [hours, minutes] = alarm.time.split(':').map(Number)
        const alarmMinutes = hours * 60 + minutes
        return { alarm, minutes: alarmMinutes }
      })
      .filter(({ minutes }) => minutes > currentMinutes)
      .sort((a, b) => a.minutes - b.minutes)[0]

    if (!nextAlarm && enabledAlarms.some(alarm => alarm.recurring)) {
      // If no alarm today, find earliest recurring alarm tomorrow
      nextAlarm = enabledAlarms
        .filter(alarm => alarm.recurring)
        .map(alarm => {
          const [hours, minutes] = alarm.time.split(':').map(Number)
          const alarmMinutes = hours * 60 + minutes
          return { alarm, minutes: alarmMinutes }
        })
        .sort((a, b) => a.minutes - b.minutes)[0]
    }

    return nextAlarm?.alarm || null
  }

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const nextAlarm = getNextAlarm()

  return (
    <div className="space-y-6">
      {/* Current Time & Next Alarm */}
      <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Alarm System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-3xl font-mono text-blue-100 mb-2">
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <div className="text-sm text-blue-300">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {nextAlarm && (
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-200">Next Alarm</p>
                  <p className="text-blue-100 font-mono text-lg">{nextAlarm.time}</p>
                  <p className="text-sm text-blue-300">{nextAlarm.label}</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Alarms */}
      <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Active Alarms
            </span>
            <Button
              onClick={() => setIsAddingAlarm(!isAddingAlarm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAddingAlarm ? 'Cancel' : 'Add Alarm'}
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {alarms.map(alarm => (
              <div key={alarm.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={alarm.enabled}
                    onCheckedChange={() => toggleAlarm(alarm.id)}
                  />
                  <div>
                    <p className="font-mono text-lg text-blue-100">{alarm.time}</p>
                    <p className="text-sm text-blue-300">{alarm.label}</p>
                    <div className="flex space-x-2 mt-1">
                      {alarm.recurring && (
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                          Recurring
                        </Badge>
                      )}
                      {alarm.sound && (
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-300">
                          Sound
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => removeAlarm(alarm.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  Remove
                </Button>
              </div>
            ))}
            
            {alarms.length === 0 && (
              <p className="text-center text-slate-400 py-4">No alarms set</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add New Alarm */}
      {isAddingAlarm && (
        <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Add New Alarm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="alarm-time" className="text-blue-200">Time</Label>
                <Input
                  id="alarm-time"
                  type="time"
                  value={newAlarm.time}
                  onChange={(e) => setNewAlarm(prev => ({...prev, time: e.target.value}))}
                  className="bg-slate-700 border-blue-500/20 font-mono"
                />
              </div>
              
              <div>
                <Label htmlFor="alarm-label" className="text-blue-200">Label</Label>
                <Input
                  id="alarm-label"
                  placeholder="e.g., Wake up call"
                  value={newAlarm.label}
                  onChange={(e) => setNewAlarm(prev => ({...prev, label: e.target.value}))}
                  className="bg-slate-700 border-blue-500/20"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={newAlarm.recurring}
                  onCheckedChange={(checked) => setNewAlarm(prev => ({...prev, recurring: checked}))}
                />
                <Label htmlFor="recurring" className="text-blue-200">Repeat daily</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="sound"
                  checked={newAlarm.sound}
                  onCheckedChange={(checked) => setNewAlarm(prev => ({...prev, sound: checked}))}
                />
                <Label htmlFor="sound" className="text-blue-200">Sound enabled</Label>
              </div>
            </div>
            
            <Button 
              onClick={addAlarm} 
              disabled={!newAlarm.time}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Set Alarm
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}