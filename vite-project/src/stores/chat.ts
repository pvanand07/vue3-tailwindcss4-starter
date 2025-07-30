import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Chat, ChatMessage } from '../types/chat'

// API Configuration
const CONFIG = {
  API_ENDPOINT: '/api/v1/chat', // Using Vite proxy
  MAX_MESSAGE_LENGTH: 4000,
  SAVE_DEBOUNCE_MS: 3000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 100
}

// Utility functions
const utils = {
  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  formatDateRelative(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  },

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },

  truncateText(text: string, maxLength: number) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  },

  debounce(func: Function, wait: number) {
    let timeout: number
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
}

export const useChatStore = defineStore('chat', () => {
  // State
  const messages = ref<ChatMessage[]>([])
  const chatHistory = ref<Chat[]>([])
  const currentChatId = ref<string | null>(null)
  const currentChatTitle = ref('')
  const isLoading = ref(false)
  const isTyping = ref(false)
  const isThinking = ref(false)
  const errorMessage = ref('')
  const abortController = ref<AbortController | null>(null)
  const selectedModel = ref('openai/gpt-4.1-mini')
  const selectedState = ref('')
  const selectedCode = ref('')
  const selectedProjectType = ref('')
  const selectedSiteType = ref('')
  const conversationId = ref<string | null>(null)
  const isSaving = ref(false)

  // Computed
  const hasUserMessages = computed(() => {
    return messages.value.some(msg => msg.role === 'user')
  })

  const currentChat = computed(() => {
    return chatHistory.value.find(chat => chat._id === currentChatId.value)
  })

  // Utils
  const generateId = () => utils.generateId()

  const generateChatTitle = () => {
    const userMessages = messages.value.filter(msg => msg.role === 'user')
    if (userMessages.length > 0) {
      const firstMessage = userMessages[0].content
      return utils.truncateText(firstMessage, 50)
    }
    return 'New Chat'
  }

  const getLastMessage = (chat: Chat) => {
    const lastMsg = chat.messages[chat.messages.length - 1]
    if (!lastMsg) return 'No messages'
    return utils.truncateText(lastMsg.content, 60)
  }

  const formatDate = (dateString: string) => {
    return utils.formatDateRelative(dateString)
  }

  // Persistence
  const STORAGE_KEY = 'chat-history'

  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory.value))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        chatHistory.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      chatHistory.value = []
    }
  }

  // Core functions
  const resetConversation = () => {
    conversationId.value = uuidv4()
    messages.value = []
  }

  // API Functions
  const sendMessageToAPI = async (userMessage: string) => {
    if (!conversationId.value) {
      resetConversation()
    }

    try {
      abortController.value = new AbortController()
      
      // Prepare request body
      const requestBody: any = {
        query: userMessage,
        conversation_id: conversationId.value
      }
      
      if (selectedModel.value) {
        requestBody.model_id = selectedModel.value
      }

      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: abortController.value.signal
      })
      
      if (!response.body) throw new Error('No response body')
      if (!response.ok) throw new Error(`API Error: ${response.status}`)

      // Add assistant message placeholder
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        id: generateId(),
        isLoading: true,
        tools: [],
        thinkingExpanded: false
      }
      messages.value.push(assistantMessage)

      const assistantIndex = messages.value.length - 1
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let responseContent = ''
      isTyping.value = false
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data:')) continue
          
          try {
            const eventData = JSON.parse(line.substring(5).trim())
            
            if (eventData.type === 'tool_start') {
              const toolName = eventData.tool
              const toolInput = Array.isArray(eventData.input) 
                ? eventData.input.join(', ') 
                : JSON.stringify(eventData.input)
              const reasoning = eventData.reasoning || ''
              
              if (!messages.value[assistantIndex].tools) {
                messages.value[assistantIndex].tools = []
              }
              
              messages.value[assistantIndex].tools!.push({
                name: toolName,
                input: toolInput,
                reasoning: reasoning
              })
              
              // Auto-expand thinking section on first tool
              if (messages.value[assistantIndex].tools!.length === 1) {
                messages.value[assistantIndex].thinkingExpanded = true
              }
            } else if (eventData.type === 'chunk') {
              responseContent += eventData.content
              messages.value[assistantIndex].content = responseContent
            }
          } catch (e) {
            console.error('Error parsing JSON:', e, line)
          }
        }
      }
      
      messages.value[assistantIndex].isLoading = false
      
      // Generate title if this is the first user message
      if (!currentChatTitle.value && messages.value.filter(m => m.role === 'user').length === 1) {
        currentChatTitle.value = generateChatTitle()
      }
      
      // Auto-save after response is complete
      await saveCurrentChat()
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('Request aborted')
      } else {
        console.error('Error in sendMessageToAPI:', error)
        errorMessage.value = `Error: ${error.message}`
      }
    } finally {
      isLoading.value = false
      isTyping.value = false
      abortController.value = null
    }
  }

  const cancelRequest = () => {
    if (abortController.value) {
      abortController.value.abort()
      const loadingMessageIndex = messages.value.findIndex(msg => msg.isLoading)
      if (loadingMessageIndex !== -1) {
        messages.value[loadingMessageIndex].isLoading = false
      }
    }
  }

  // Actions
  const startNewChat = () => {
    // Save current chat before starting new one
    if (currentChatId.value && messages.value.length > 0) {
      saveCurrentChat()
    }

    currentChatId.value = generateId()
    currentChatTitle.value = ''
    resetConversation()
    errorMessage.value = ''
  }

  const loadChat = (chat: Chat) => {
    // Save current chat before switching
    if (currentChatId.value && messages.value.length > 0) {
      saveCurrentChat()
    }

    currentChatId.value = chat._id
    currentChatTitle.value = chat.title
    conversationId.value = chat.conversationId || uuidv4()
    messages.value = chat.messages.map(msg => ({
      ...msg,
      isLoading: false,
      tools: msg.tools || [],
      thinkingExpanded: msg.thinkingExpanded || false
    }))
  }

  const saveCurrentChat = async () => {
    if (!currentChatId.value || messages.value.length === 0 || isSaving.value) {
      return
    }
    
    isSaving.value = true
    
    try {
      const chatIndex = chatHistory.value.findIndex(chat => chat._id === currentChatId.value)
      const chatData: Chat = {
        _id: currentChatId.value,
        title: currentChatTitle.value || generateChatTitle(),
        messages: messages.value.map(msg => ({
          role: msg.role,
          content: msg.content,
          id: msg.id,
          tools: msg.tools || [],
          thinkingExpanded: msg.thinkingExpanded || false,
          timestamp: msg.timestamp || new Date().toISOString()
        })),
        conversationId: conversationId.value || uuidv4(),
        createdAt: chatIndex === -1 ? new Date().toISOString() : chatHistory.value[chatIndex].createdAt,
        updatedAt: new Date().toISOString()
      }

      if (chatIndex === -1) {
        // New chat
        chatHistory.value.unshift(chatData)
      } else {
        // Update existing chat
        chatHistory.value[chatIndex] = chatData
      }

      // Update current title
      currentChatTitle.value = chatData.title

      // Save to localStorage
      saveToStorage()
    } catch (error) {
      console.error('Error saving chat:', error)
    } finally {
      isSaving.value = false
    }
  }

  const debouncedSaveChat = utils.debounce(saveCurrentChat, CONFIG.SAVE_DEBOUNCE_MS)

  const deleteChat = (chatId: string) => {
    const index = chatHistory.value.findIndex(chat => chat._id === chatId)
    if (index !== -1) {
      chatHistory.value.splice(index, 1)
      saveToStorage()

      // If we deleted the current chat, start a new one
      if (currentChatId.value === chatId) {
        startNewChat()
      }
    }
  }

  const renameChat = (chatId: string, newTitle: string) => {
    const chatIndex = chatHistory.value.findIndex(chat => chat._id === chatId)
    if (chatIndex !== -1) {
      chatHistory.value[chatIndex].title = newTitle
      chatHistory.value[chatIndex].updatedAt = new Date().toISOString()
      saveToStorage()

      // Update current title if this is the current chat
      if (currentChatId.value === chatId) {
        currentChatTitle.value = newTitle
      }
    }
  }

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date().toISOString(),
      tools: message.tools || [],
      thinkingExpanded: message.thinkingExpanded || false
    }
    
    messages.value.push(newMessage)

    // Generate title if this is the first user message
    if (!currentChatTitle.value && message.role === 'user' && messages.value.filter(m => m.role === 'user').length === 1) {
      currentChatTitle.value = generateChatTitle()
    }

    // Auto-save after adding message (with debounce to avoid too frequent saves)
    debouncedSaveChat()

    return newMessage
  }

  const updateMessage = (messageId: string, updates: Partial<ChatMessage>) => {
    const messageIndex = messages.value.findIndex(msg => msg.id === messageId)
    if (messageIndex !== -1) {
      messages.value[messageIndex] = { ...messages.value[messageIndex], ...updates }
    }
  }

  const toggleThinking = (messageIndex: number) => {
    if (messages.value[messageIndex]) {
      messages.value[messageIndex].thinkingExpanded = !messages.value[messageIndex].thinkingExpanded
    }
  }

  const generateQuickQuestion = () => {
    let question = "What are the building regulations"
    
    if (selectedProjectType.value) {
      question += ` for ${selectedProjectType.value} projects`
    }
    
    if (selectedState.value) {
      const stateName = selectedState.value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      question += ` in ${stateName}`
    }
    
    if (selectedCode.value) {
      question += ` according to ${selectedCode.value.toUpperCase()}`
    }
    
    if (selectedSiteType.value) {
      const siteType = selectedSiteType.value.replace(/-/g, ' ')
      question += ` for ${siteType} sites`
    }
    
    question += "?"
    return question
  }

  // Initialize
  const initialize = () => {
    loadFromStorage()
    if (chatHistory.value.length === 0) {
      // Add sample chats for UI testing
      chatHistory.value = [
        {
          _id: 'sample-1',
          title: 'Building Regulations Query',
          messages: [
            { 
              id: '1', 
              role: 'user', 
              content: 'What are the setback requirements for residential buildings?',
              timestamp: new Date(Date.now() - 60000).toISOString(),
              tools: [],
              thinkingExpanded: false
            },
            { 
              id: '2', 
              role: 'assistant', 
              content: 'The setback requirements vary by zone and local regulations. For residential buildings, typical setbacks include:\n\n1. Front setback: Usually 5-10 meters from the road\n2. Side setbacks: 1.5-3 meters from property boundaries\n3. Rear setback: 3-6 meters from the back boundary\n\nThese can vary based on your specific location and building codes.',
              timestamp: new Date(Date.now() - 30000).toISOString(),
              tools: [],
              thinkingExpanded: false
            }
          ],
          conversationId: uuidv4(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 30000).toISOString()
        },
        {
          _id: 'sample-2',
          title: 'Fire Safety Compliance',
          messages: [
            { 
              id: '3', 
              role: 'user', 
              content: 'What are the fire safety requirements for commercial buildings in Kerala?',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              tools: [],
              thinkingExpanded: false
            },
            { 
              id: '4', 
              role: 'assistant', 
              content: 'Fire safety requirements for commercial buildings in Kerala include:\n\n1. Fire escape routes with minimum 1.5m width\n2. Fire extinguishers at every 30m distance\n3. Sprinkler systems for buildings above 15m height\n4. NOC from Fire Department for buildings above 1000 sqm\n5. Emergency lighting and exit signs\n\nSpecific requirements depend on building height, occupancy, and usage type.',
              timestamp: new Date(Date.now() - 3300000).toISOString(),
              tools: [],
              thinkingExpanded: false
            }
          ],
          conversationId: uuidv4(),
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3300000).toISOString()
        },
        {
          _id: 'sample-3',
          title: 'Parking Requirements',
          messages: [
            { 
              id: '5', 
              role: 'user', 
              content: 'How many parking spaces are required for a shopping mall?',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              tools: [],
              thinkingExpanded: false
            },
            { 
              id: '6', 
              role: 'assistant', 
              content: 'Parking requirements for shopping malls typically follow these guidelines:\n\n1. One car parking space for every 20-25 sqm of retail area\n2. Two-wheeler parking: 40% of car parking spaces\n3. Separate loading/unloading bays\n4. Handicapped parking: 2% of total spaces\n5. Minimum aisle width: 6m for two-way traffic\n\nLocal building byelaws may have specific variations.',
              timestamp: new Date(Date.now() - 7000000).toISOString(),
              tools: [],
              thinkingExpanded: false
            }
          ],
          conversationId: uuidv4(),
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date(Date.now() - 7000000).toISOString()
        }
      ]
      saveToStorage()
    }
    startNewChat()
  }

  return {
    // State
    messages,
    chatHistory,
    currentChatId,
    currentChatTitle,
    isLoading,
    isTyping,
    isThinking,
    errorMessage,
    abortController,
    selectedModel,
    selectedState,
    selectedCode,
    selectedProjectType,
    selectedSiteType,
    conversationId,
    isSaving,

    // Computed
    hasUserMessages,
    currentChat,

    // Utils
    getLastMessage,
    formatDate,

    // Actions
    startNewChat,
    loadChat,
    saveCurrentChat,
    deleteChat,
    renameChat,
    addMessage,
    updateMessage,
    toggleThinking,
    generateQuickQuestion,
    sendMessageToAPI,
    cancelRequest,
    initialize
  }
})