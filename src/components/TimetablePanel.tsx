'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'


interface TimetableEntry {
  id: string
  day: string
  time: string
  subject: string
  location: string
}

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function TimetablePanel() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [newEntry, setNewEntry] = useState({
    day: '',
    time: '',
    subject: '',
    location: ''
  })
  const [upcomingClass, setUpcomingClass] = useState<TimetableEntry | null>(null)

  // Load initial timetable data
  useEffect(() => {
    const savedTimetable = localStorage.getItem('jarvis-timetable')
    if (savedTimetable) {
      setTimetable(JSON.parse(savedTimetable))
    } else {
      // Set default timetable from the original Python code
      const defaultTimetable: TimetableEntry[] = [
        {
          id: '1',
          day: 'monday',
          time: '09:00',
          subject: 'Mathematics',
          location: 'Room 101'
        },
        {
          id: '2',
          day: 'monday',
          time: '11:00',
          subject: 'Physics',
          location: 'Room 202'
        },
        {
          id: '3',
          day: 'monday',
          time: '14:00',
          subject: 'Computer Lab',
          location: 'Lab 3'
        },
        {
          id: '4',
          day: 'tuesday',
          time: '10:00',
          subject: 'English',
          location: 'Room 105'
        },
        {
          id: '5',
          day: 'tuesday',
          time: '13:00',
          subject: 'Electronics',
          location: 'Room 201'
        }
      ]
      setTimetable(defaultTimetable)
    }
  }, [])

  // Save timetable to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('jarvis-timetable', JSON.stringify(timetable))
    checkUpcomingClass()
  }, [timetable])

  // Check for upcoming classes
  const checkUpcomingClass = () => {
    const now = new Date()
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const currentTime = now.getHours() * 60 + now.getMinutes() // minutes since midnight
    
    const todayClasses = timetable
      .filter(entry => entry.day === currentDay)
      .sort((a, b) => {
        const [aHours, aMinutes] = a.time.split(':').map(Number)
        const [bHours, bMinutes] = b.time.split(':').map(Number)
        return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes)
      })
    
    const nextClass = todayClasses.find(entry => {
      const [hours, minutes] = entry.time.split(':').map(Number)
      const classTime = hours * 60 + minutes
      return classTime > currentTime
    })
    
    setUpcomingClass(nextClass || null)
  }

  const addEntry = () => {
    if (newEntry.day && newEntry.time && newEntry.subject) {
      const entry: TimetableEntry = {
        id: Date.now().toString(),
        day: newEntry.day,
        time: newEntry.time,
        subject: newEntry.subject,
        location: newEntry.location || 'Not specified'
      }
      
      setTimetable(prev => [...prev, entry])
      setNewEntry({ day: '', time: '', subject: '', location: '' })
      setIsAddingEntry(false)
    }
  }

  const removeEntry = (id: string) => {
    setTimetable(prev => prev.filter(entry => entry.id !== id))
  }

  const getTodaySchedule = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    return timetable
      .filter(entry => entry.day === today)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  const getWeekSchedule = () => {
    return DAYS_OF_WEEK.map(day => ({
      day,
      classes: timetable
        .filter(entry => entry.day === day)
        .sort((a, b) => a.time.localeCompare(b.time))
    }))
  }

  return (
    <div className="space-y-6">
      {/* Today's Schedule */}
      <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Today's Schedule
            </span>
            <Badge variant="outline" className="border-blue-500/30 text-blue-300">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingClass && (
            <div className="mb-4 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-200">Next Class</p>
                  <p className="text-blue-100">{upcomingClass.subject}</p>
                  <p className="text-sm text-blue-300">
                    {upcomingClass.time} at {upcomingClass.location}
                  </p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {getTodaySchedule().map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-100">{entry.subject}</p>
                  <p className="text-sm text-blue-300">{entry.time} - {entry.location}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => removeEntry(entry.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  Remove
                </Button>
              </div>
            ))}
            
            {getTodaySchedule().length === 0 && (
              <p className="text-center text-slate-400 py-4">No classes scheduled for today</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add New Entry */}
      <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Add Class
            </span>
            <Button
              onClick={() => setIsAddingEntry(!isAddingEntry)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAddingEntry ? 'Cancel' : 'Add Class'}
            </Button>
          </CardTitle>
        </CardHeader>
        
        {isAddingEntry && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="day" className="text-blue-200">Day</Label>
                <Select value={newEntry.day} onValueChange={(value) => setNewEntry(prev => ({...prev, day: value}))}>
                  <SelectTrigger className="bg-slate-700 border-blue-500/20">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day} value={day}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="time" className="text-blue-200">Time</Label>
                <Input
                  type="time"
                  value={newEntry.time}
                  onChange={(e) => setNewEntry(prev => ({...prev, time: e.target.value}))}
                  className="bg-slate-700 border-blue-500/20"
                />
              </div>
              
              <div>
                <Label htmlFor="subject" className="text-blue-200">Subject</Label>
                <Input
                  placeholder="e.g., Mathematics"
                  value={newEntry.subject}
                  onChange={(e) => setNewEntry(prev => ({...prev, subject: e.target.value}))}
                  className="bg-slate-700 border-blue-500/20"
                />
              </div>
              
              <div>
                <Label htmlFor="location" className="text-blue-200">Location</Label>
                <Input
                  placeholder="e.g., Room 101"
                  value={newEntry.location}
                  onChange={(e) => setNewEntry(prev => ({...prev, location: e.target.value}))}
                  className="bg-slate-700 border-blue-500/20"
                />
              </div>
            </div>
            
            <Button 
              onClick={addEntry} 
              disabled={!newEntry.day || !newEntry.time || !newEntry.subject}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Add to Schedule
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Weekly Overview */}
      <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Weekly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getWeekSchedule().map(({ day, classes }) => (
              <div key={day}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-200 capitalize">{day}</h3>
                  <Badge variant="secondary" className="bg-slate-700">
                    {classes.length} {classes.length === 1 ? 'class' : 'classes'}
                  </Badge>
                </div>
                
                {classes.length > 0 ? (
                  <div className="space-y-2 pl-4">
                    {classes.map(entry => (
                      <div key={entry.id} className="text-sm text-blue-100">
                        {entry.time} - {entry.subject} ({entry.location})
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 pl-4">No classes</p>
                )}
                
                {day !== 'sunday' && <Separator className="mt-3 bg-blue-500/10" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}