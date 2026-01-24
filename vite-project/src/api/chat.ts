import type { ChatMessage, Thread, ThreadListResponse, ThreadMessagesResponse } from '../types/chat'

// API Configuration
export const API_CONFIG = {
  ENDPOINT: '/api/v1/chat',
  THREADS_ENDPOINT: '/api/v1/threads',
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 100
} as const

// API Request/Response Types
export interface ChatRequest {
  query: string
  thread_id?: string
  user_id: string
  model_id?: string
}

export interface ChatStreamEvent {
  type: 'tool_start' | 'chunk' | 'tool_end' | 'full_response' | 'error'
  name?: string
  tool?: string
  input?: any
  reasoning?: string
  content?: string
  output?: string
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
    onToolEnd: (toolName: string) => void,
    onChunk: (content: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    console.log('📡 ChatAPI: Sending request with payload:', {
      query: request.query.substring(0, 50) + '...',
      thread_id: request.thread_id || 'new thread',
      user_id: request.user_id,
      model_id: request.model_id
    })
    
    console.log('📤 Full request body:', JSON.stringify(request, null, 2))
    
    const response = await fetch(API_CONFIG.ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(request),
      signal
    })

    console.log('📥 Response status:', response.status, response.statusText)
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.body) {
      console.error('❌ No response body')
      throw new Error('No response body')
    }
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', response.status, errorText)
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log('🏁 Stream done')
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        console.log('📨 Raw chunk received:', {
          size: chunk.length,
          chunk: chunk.substring(0, 200) + (chunk.length > 200 ? '...' : '')
        })
        buffer += chunk
        
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          console.log('📥 Raw SSE line:', trimmed)

          // Skip lines that don't start with 'data:'
          if (!trimmed.startsWith('data:')) {
            console.log('⏭️ Skipping non-data line')
            continue
          }

          // Remove 'data:' prefix and parse JSON
          const jsonStr = trimmed.substring(5).trim()
          if (!jsonStr) {
            console.log('⏭️ Empty data line')
            continue
          }

          try {
            const eventData: ChatStreamEvent = JSON.parse(jsonStr)
            console.log('📦 Parsed event:', eventData)

            if (eventData.type === 'tool_start') {
              const toolName = eventData.name || eventData.tool || 'Unknown Tool'
              const toolInput = Array.isArray(eventData.input) 
                ? eventData.input.join(', ') 
                : JSON.stringify(eventData.input || '')
              const reasoning = eventData.reasoning || ''

              console.log('🔧 Tool started:', toolName)
              onToolStart({
                name: toolName,
                input: toolInput,
                reasoning: reasoning
              })
            } else if (eventData.type === 'tool_end') {
              const toolName = eventData.name || 'Unknown Tool'
              console.log('✅ Tool ended:', toolName)
              onToolEnd(toolName)
            } else if (eventData.type === 'chunk' && eventData.content) {
              console.log('💬 Chunk received:', {
                length: eventData.content.length,
                content: eventData.content
              })
              onChunk(eventData.content)
            } else if (eventData.type === 'error') {
              console.error('❌ Error event:', eventData.content)
              throw new Error(eventData.content || 'Unknown error')
            }
          } catch (e) {
            if (trimmed.length < 1000) {
              console.warn('⚠️ Failed to parse SSE event:', trimmed.substring(0, 100), e)
            }
          }
        }
      }
      
      if (buffer.trim()) {
        const trimmed = buffer.trim()
        console.log('📥 Final buffer:', trimmed)
        
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.substring(5).trim()
          if (jsonStr) {
            try {
              const eventData: ChatStreamEvent = JSON.parse(jsonStr)
              console.log('📦 Final buffer parsed:', eventData)
              if (eventData.type === 'chunk' && eventData.content) {
                console.log('💬 Final chunk:', eventData.content)
                onChunk(eventData.content)
              }
            } catch (e) {
              console.warn('⚠️ Failed to parse final buffer:', jsonStr.substring(0, 100), e)
            }
          }
        }
      }
      
      console.log('✅ SSE stream completed')
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
    threadId: string | null,
    userId: string,
    modelId?: string
  ): ChatRequest {
    const request: ChatRequest = {
      query,
      user_id: userId
    }

    if (threadId) {
      request.thread_id = threadId
    }

    if (modelId) {
      request.model_id = modelId
    }

    return request
  }

  /**
   * List threads for a user
   */
  async listThreads(
    userId: string,
    limit: number = 20,
    after?: string,
    order: 'asc' | 'desc' = 'desc'
  ): Promise<ThreadListResponse> {
    const params = new URLSearchParams({
      user_id: userId,
      limit: limit.toString(),
      order
    })
    
    if (after) {
      params.append('after', after)
    }

    const response = await fetch(`${API_CONFIG.THREADS_ENDPOINT}?${params}`)
    
    if (!response.ok) {
      throw new Error(`Failed to list threads: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get messages for a specific thread
   */
  async getThreadMessages(
    threadId: string,
    userId: string,
    limit: number = 50,
    after?: string,
    order: 'asc' | 'desc' = 'asc'
  ): Promise<ThreadMessagesResponse> {
    const params = new URLSearchParams({
      user_id: userId,
      limit: limit.toString(),
      order
    })
    
    if (after) {
      params.append('after', after)
    }

    const response = await fetch(`${API_CONFIG.THREADS_ENDPOINT}/${threadId}/messages?${params}`)
    
    if (!response.ok) {
      throw new Error(`Failed to get thread messages: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Rename a thread
   */
  async renameThread(
    threadId: string,
    userId: string,
    title: string
  ): Promise<Thread> {
    const response = await fetch(`${API_CONFIG.THREADS_ENDPOINT}/${threadId}/rename?user_id=${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to rename thread: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Delete a thread
   */
  async deleteThread(
    threadId: string,
    userId: string
  ): Promise<void> {
    const response = await fetch(`${API_CONFIG.THREADS_ENDPOINT}/${threadId}?user_id=${userId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete thread: ${response.status}`)
    }
  }
}

// Export singleton instance
export const chatAPI = ChatAPI.getInstance()