

export async function processCommand(input: string): Promise<string> {
  try {
    // Check for specific command patterns first
    const lowercaseInput = input.toLowerCase()
    
    // Search command
    if (lowercaseInput.includes('search') || lowercaseInput.includes('look up') || lowercaseInput.includes('find')) {
      const query = extractSearchQuery(input)
      if (query) {
        // Open search in new tab
        if (typeof window !== 'undefined') {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank')
        }
        return `Searching for "${query}", Boss. I've opened the results in a new tab for you.`
      }
    }

    // For other commands or general conversation, use AI via our API route
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: input
      })
    })

    const data = await response.json()
    
    if (data.success && data.response) {
      return data.response
    } else {
      throw new Error(data.error || 'Invalid response from AI service')
    }

  } catch (error) {
    console.error('Error processing command:', error)
    
    // Fallback responses for common commands
    const lowercaseInput = input.toLowerCase()
    
    if (lowercaseInput.includes('hello') || lowercaseInput.includes('hi')) {
      return "Hello Boss! How can I assist you today?"
    }
    
    if (lowercaseInput.includes('time')) {
      return `The current time is ${new Date().toLocaleTimeString()}, Boss.`
    }
    
    if (lowercaseInput.includes('date')) {
      return `Today is ${new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}, Boss.`
    }
    
    return "I apologize Boss, I'm having trouble processing that request at the moment. Please try again."
  }
}

function extractSearchQuery(input: string): string {
  const searchPatterns = [
    /search\s+(?:for\s+)?(.+)/i,
    /look\s+up\s+(.+)/i,
    /find\s+(.+)/i,
    /google\s+(.+)/i
  ]
  
  for (const pattern of searchPatterns) {
    const match = input.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  // If no pattern matches, return the input minus common search words
  return input.replace(/^(search|look up|find|google)\s+/i, '').trim()
}