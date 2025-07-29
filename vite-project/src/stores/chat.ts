import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Chat, ChatMessage, ChatState } from '../types/chat'

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
  const selectedModel = ref('openai/gpt-4.1-mini')
  const selectedState = ref('')
  const selectedCode = ref('')
  const selectedProjectType = ref('')
  const selectedSiteType = ref('')

  // Computed
  const hasUserMessages = computed(() => {
    return messages.value.some(msg => msg.role === 'user')
  })

  const currentChat = computed(() => {
    return chatHistory.value.find(chat => chat._id === currentChatId.value)
  })

  // Utils
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const generateChatTitle = () => {
    const userMessages = messages.value.filter(msg => msg.role === 'user')
    if (userMessages.length > 0) {
      const firstMessage = userMessages[0].content
      return firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage
    }
    return 'New Chat'
  }

  const getLastMessage = (chat: Chat) => {
    const lastMsg = chat.messages[chat.messages.length - 1]
    if (!lastMsg) return 'No messages'
    const content = lastMsg.content.length > 60 ? lastMsg.content.substring(0, 60) + '...' : lastMsg.content
    return content
  }

  const formatDate = (dateString: string) => {
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

  // Actions
  const startNewChat = () => {
    // Save current chat before starting new one
    if (currentChatId.value && messages.value.length > 0) {
      saveCurrentChat()
    }

    currentChatId.value = generateId()
    currentChatTitle.value = ''
    messages.value = []
    errorMessage.value = ''
  }

  const loadChat = (chat: Chat) => {
    // Save current chat before switching
    if (currentChatId.value && messages.value.length > 0) {
      saveCurrentChat()
    }

    currentChatId.value = chat._id
    currentChatTitle.value = chat.title
    messages.value = chat.messages.map(msg => ({
      ...msg,
      isLoading: false,
      tools: msg.tools || [],
      thinkingExpanded: msg.thinkingExpanded || false
    }))
  }

  const saveCurrentChat = () => {
    if (!currentChatId.value || messages.value.length === 0) {
      return
    }

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
      conversationId: uuidv4(),
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
  }

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
    setTimeout(() => {
      saveCurrentChat()
    }, 1000)

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
    selectedModel,
    selectedState,
    selectedCode,
    selectedProjectType,
    selectedSiteType,

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
    initialize
  }
})