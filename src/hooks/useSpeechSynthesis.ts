'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    // Check if browser supports speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true)

      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices()
        setVoices(availableVoices)
        
        // Try to find a female voice or default to the first available
        const femaleVoice = availableVoices.find(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.name.toLowerCase().includes('zira') ||
          voice.name.toLowerCase().includes('karen') ||
          voice.name.toLowerCase().includes('samantha')
        )
        
        setSelectedVoice(femaleVoice || availableVoices[1] || availableVoices[0] || null)
      }

      // Load voices immediately
      loadVoices()
      
      // Also load voices when they become available (some browsers load them asynchronously)
      speechSynthesis.onvoiceschanged = loadVoices

      return () => {
        speechSynthesis.onvoiceschanged = null
      }
    } else {
      setIsSupported(false)
    }
    
    return undefined
  }, [])

  const speak = useCallback((text: string, options?: {
    rate?: number
    pitch?: number
    volume?: number
  }) => {
    if (!isSupported || !text.trim()) {
      return
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    // Apply voice settings
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
    
    utterance.rate = options?.rate ?? 0.9
    utterance.pitch = options?.pitch ?? 1.0
    utterance.volume = options?.volume ?? 1.0

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      setIsSpeaking(false)
    }

    try {
      speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('Error speaking text:', error)
      setIsSpeaking(false)
    }
  }, [isSupported, selectedVoice])

  const stop = useCallback(() => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const pause = useCallback(() => {
    speechSynthesis.pause()
  }, [])

  const resume = useCallback(() => {
    speechSynthesis.resume()
  }, [])

  const changeVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice)
  }, [])

  return {
    isSupported,
    isSpeaking,
    voices,
    selectedVoice,
    speak,
    stop,
    pause,
    resume,
    changeVoice
  }
}