import type { ChatMessage } from '../types/chat'

// API Configuration
export const API_CONFIG = {
  ENDPOINT: '/api/v1/chat', // Using Vite proxy
  IMAGE_ENDPOINT: '/api/v1/chat-image', // Image creation endpoint
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 100
} as const

// API Request/Response Types
export interface ChatRequest {
  query: string
  conversation_id: string
  model_id?: string
  context?: string
  user_id?: string
  images_data?: string[]
}

export interface ChatStreamEvent {
  type: 'tool_start' | 'chunk' | 'tool_end' | 'progress' | 'full_response' | 'image'
  name?: string
  tool?: string
  input?: any
  reasoning?: string
  content?: string
  output?: string
  data?: string
  image_url?: string
  artifacts_data?: {
    chart_svg?: string
  }
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
    onToolEnd: (toolName: string, chartSvg?: string) => void,
    onChunk: (content: string) => void,
    onImage: (imageUrl: string) => void,
    signal?: AbortSignal,
    useImageEndpoint: boolean = false
  ): Promise<void> {
    const endpoint = useImageEndpoint ? API_CONFIG.IMAGE_ENDPOINT : API_CONFIG.ENDPOINT
    
    console.log('📡 ChatAPI: Sending request to', endpoint, 'with payload:', {
      ...request,
      query: request.query.substring(0, 50) + '...',
      images_data: request.images_data ? `[${request.images_data.length} IMAGE(S)]` : undefined
    })
    
    const response = await fetch(endpoint, {
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
    let buffer = '' // Buffer for incomplete lines

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        
        // Split by newlines but keep the last incomplete line in buffer
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep the last (potentially incomplete) line

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data:')) continue

          const jsonStr = line.substring(5).trim()
          if (!jsonStr || jsonStr.length === 0) continue // Skip empty data lines
          
          // Basic validation: must start with { and end with }
          if (!jsonStr.startsWith('{') || !jsonStr.endsWith('}')) {
            // Incomplete JSON, will be completed in next chunk
            continue
          }

          try {
            const eventData: ChatStreamEvent = JSON.parse(jsonStr)

            if (eventData.type === 'tool_start') {
              const toolName = eventData.name || eventData.tool || 'Unknown Tool'
              const toolInput = Array.isArray(eventData.input) 
                ? eventData.input.join(', ') 
                : JSON.stringify(eventData.input || '')
              const reasoning = eventData.reasoning || ''

              onToolStart({
                name: toolName,
                input: toolInput,
                reasoning: reasoning
              })
            } else if (eventData.type === 'tool_end') {
              const toolName = eventData.name || 'Unknown Tool'
              const chartSvg = eventData.artifacts_data?.chart_svg
              onToolEnd(toolName, chartSvg)
            } else if (eventData.type === 'chunk' && eventData.content) {
              onChunk(eventData.content)
            } else if (eventData.type === 'image' && eventData.image_url) {
              onImage(eventData.image_url)
            }
          } catch (e) {
            // Silently skip parse errors - they're expected for malformed/incomplete data
            // Only log if it looks like it should have been valid
            if (jsonStr.length < 1000) {
              console.warn('Failed to parse SSE event:', jsonStr.substring(0, 100))
            }
          }
        }
      }
      
      // Process any remaining data in buffer
      if (buffer.trim()) {
        const line = buffer.trim()
        if (line.startsWith('data:')) {
          const jsonStr = line.substring(5).trim()
          if (jsonStr && jsonStr.startsWith('{') && jsonStr.endsWith('}')) {
            try {
              const eventData: ChatStreamEvent = JSON.parse(jsonStr)
              if (eventData.type === 'image' && eventData.image_url) {
                onImage(eventData.image_url)
              } else if (eventData.type === 'chunk' && eventData.content) {
                onChunk(eventData.content)
              }
            } catch (e) {
              console.warn('Failed to parse final buffer:', jsonStr.substring(0, 100))
            }
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
  createRequest(
    query: string,
    conversationId: string,
    modelId?: string,
    locationContext?: string,
    userId?: string,
    imagesData?: string[],
    isCreateMode: boolean = false
  ): ChatRequest {
    const baseContext = isCreateMode 
      ? 'Create or generate images based on the provided context and user request'
      : ''
    const context = locationContext ? `${locationContext}${baseContext}` : baseContext

    const request: ChatRequest = {
      query,
      conversation_id: conversationId,
      context,
      user_id: userId || 'anonymous'
    }

    if (modelId && !isCreateMode) {
      request.model_id = modelId
    }

    if (imagesData && imagesData.length > 0) {
      request.images_data = imagesData
    }

    return request
  }
}

// Export singleton instance
export const chatAPI = ChatAPI.getInstance()