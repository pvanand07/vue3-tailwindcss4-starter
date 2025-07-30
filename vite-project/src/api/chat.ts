import type { ChatMessage } from '../types/chat'

// API Configuration
export const API_CONFIG = {
  ENDPOINT: '/api/v1/chat', // Using Vite proxy
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 100
} as const

// API Request/Response Types
export interface ChatRequest {
  query: string
  conversation_id: string
  model_id?: string
}

export interface ChatStreamEvent {
  type: 'tool_start' | 'chunk'
  tool?: string
  input?: any
  reasoning?: string
  content?: string
}

export interface ChatToolData {
  name: string
  input: string
  reasoning?: string
}

// Chat API Class
export class ChatAPI {
  private static instance: ChatAPI
  
  static getInstance(): ChatAPI {
    if (!ChatAPI.instance) {
      ChatAPI.instance = new ChatAPI()
    }
    return ChatAPI.instance
  }

  /**
   * Send a message to the chat API and handle streaming response
   */
  async sendMessage(
    request: ChatRequest,
    onToolStart: (tool: ChatToolData) => void,
    onChunk: (content: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const response = await fetch(API_CONFIG.ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(request),
      signal
    })

    if (!response.body) throw new Error('No response body')
    if (!response.ok) throw new Error(`API Error: ${response.status}`)

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data:')) continue

          try {
            const eventData: ChatStreamEvent = JSON.parse(line.substring(5).trim())

            if (eventData.type === 'tool_start') {
              const toolName = eventData.tool || 'Unknown Tool'
              const toolInput = Array.isArray(eventData.input) 
                ? eventData.input.join(', ') 
                : JSON.stringify(eventData.input || '')
              const reasoning = eventData.reasoning || ''

              onToolStart({
                name: toolName,
                input: toolInput,
                reasoning: reasoning
              })
            } else if (eventData.type === 'chunk' && eventData.content) {
              onChunk(eventData.content)
            }
          } catch (e) {
            console.error('Error parsing JSON:', e, line)
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * Create a prepared message object for the API
   */
  createMessage(content: string, role: 'user' | 'assistant' | 'system' = 'user'): Omit<ChatMessage, 'id' | 'timestamp'> {
    return {
      role,
      content,
      tools: [],
      thinkingExpanded: false
    }
  }

  /**
   * Create an assistant message with loading state
   */
  createLoadingMessage(id: string): ChatMessage {
    return {
      role: 'assistant',
      content: '',
      id,
      isLoading: true,
      tools: [],
      thinkingExpanded: false,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Prepare API request object
   */
  createRequest(query: string, conversationId: string, modelId?: string): ChatRequest {
    const request: ChatRequest = {
      query,
      conversation_id: conversationId
    }
    
    if (modelId) {
      request.model_id = modelId
    }

    return request
  }
}

// Export singleton instance
export const chatAPI = ChatAPI.getInstance()