'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { processCommand } from '@/lib/commandProcessor'

interface VoiceInterfaceProps {
  isListening: boolean
  setIsListening: (listening: boolean) => void
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function VoiceInterface({ isListening, setIsListening }: VoiceInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { transcript, startListening, stopListening, resetTranscript } = useVoiceRecognition()
  const { speak, isSpeaking } = useSpeechSynthesis()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Handle voice recognition results
  useEffect(() => {
    if (transcript && !isListening) {
      handleUserInput(transcript)
      resetTranscript()
    }
  }, [transcript, isListening, resetTranscript])

  const handleUserInput = async (input: string) => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsProcessing(true)

    try {
      const response = await processCommand(input)
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Speak the response
      speak(response)
    } catch (error) {
      console.error('Error processing command:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry Boss, I encountered an error processing your request.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      speak('Sorry Boss, I encountered an error processing your request.')
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopListening()
      setIsListening(false)
    } else {
      startListening()
      setIsListening(true)
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputText.trim()) {
      handleUserInput(inputText)
    }
  }

  return (
    <div className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Voice Assistant
          </span>
          <div className="flex items-center space-x-2">
            {(isProcessing || isSpeaking) && (
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 h-[350px] pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <p>Say "Hey Jarvis" to start a conversation</p>
                <p className="text-sm">Or type your message below</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-blue-100 border border-blue-500/20'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <Separator className="bg-blue-500/20" />

        {/* Voice Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={toggleVoiceRecognition}
            size="lg"
            className={`${
              isListening
                ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-all duration-200`}
          >
            {isListening ? (
              <>
                <div className="w-4 h-4 bg-white rounded-full mr-2 animate-pulse"></div>
                Stop Listening
              </>
            ) : (
              <>
                <div className="w-4 h-4 border-2 border-white rounded-full mr-2"></div>
                Start Listening
              </>
            )}
          </Button>

          {transcript && (
            <div className="flex-1 text-sm text-blue-300">
              Recognized: "{transcript}"
            </div>
          )}
        </div>

        {/* Text Input */}
        <form onSubmit={handleTextSubmit} className="flex space-x-2">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message to Jarvis..."
            className="flex-1 bg-slate-700 border-blue-500/20 text-white placeholder-slate-400 resize-none"
            rows={2}
          />
          <Button 
            type="submit" 
            disabled={!inputText.trim() || isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Send
          </Button>
        </form>
      </CardContent>
    </div>
  )
}