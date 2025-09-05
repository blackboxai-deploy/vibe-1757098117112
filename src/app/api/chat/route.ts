import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const OPENROUTER_ENDPOINT = 'https://oi-server.onrender.com/chat/completions'
const OPENROUTER_HEADERS = {
  'customerId': 'maliomsachin.5@gmail.com',
  'Content-Type': 'application/json',
  'Authorization': 'Bearer xxx'
}

const SYSTEM_PROMPT = `You are JARVIS, a highly advanced AI assistant inspired by Tony Stark's AI. You are sophisticated, helpful, and speak with confidence and intelligence.

Key characteristics:
- Address the user as "Boss" or "Sir/Madam" respectfully
- Be concise but informative in responses
- Show personality - you're not just a tool, you're an intelligent assistant
- For search queries, acknowledge the search and provide brief context
- For scheduling tasks, be proactive and helpful
- For general conversation, be engaging and witty when appropriate

Available functions:
- Web search (when user asks to search for something)
- Schedule management (timetable operations)
- Alarm management
- General assistance and conversation

Respond naturally as JARVIS would - intelligent, helpful, and with appropriate personality.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Prepare messages for OpenRouter API
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      }
    ]

    // Add context if provided (for conversation history)
    if (context && context.length > 0) {
      messages.push(...context)
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    })

    // Call OpenRouter API
    const response = await axios.post(OPENROUTER_ENDPOINT, {
      model: 'openrouter/anthropic/claude-sonnet-4',
      messages: messages,
      max_tokens: 200,
      temperature: 0.7,
      stream: false
    }, {
      headers: OPENROUTER_HEADERS,
      timeout: 15000
    })

    if (response.data?.choices?.[0]?.message?.content) {
      const aiResponse = response.data.choices[0].message.content.trim()
      
      return NextResponse.json({
        response: aiResponse,
        success: true
      })
    } else {
      throw new Error('Invalid response from AI service')
    }

  } catch (error: any) {
    console.error('Chat API Error:', error)
    
    // Provide fallback response
    const fallbackResponse = "I apologize Boss, I'm experiencing some technical difficulties at the moment. Please try again in a moment."
    
    return NextResponse.json({
      response: fallbackResponse,
      success: false,
      error: error.message || 'Unknown error occurred'
    }, { status: 200 }) // Return 200 to provide fallback response
  }
}