import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JARVIS Assistant - Web Voice Assistant',
  description: 'A sophisticated AI-powered voice assistant inspired by Tony Stark\'s JARVIS, featuring voice recognition, intelligent responses, timetable management, and smart alarms.',
  keywords: 'voice assistant, AI, JARVIS, scheduling, alarms, speech recognition',
  authors: [{ name: 'JARVIS Assistant' }],
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}