import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Chat, ChatMessage } from '../types/chat'
import { chatAPI } from '../api/chat'
import { ChatStorage } from '../utils/storage'
import { DateUtils } from '../utils/date'
import { TextUtils } from '../utils/text'

// Store Configuration
const CONFIG = {
  MAX_MESSAGE_LENGTH: 4000,
  SAVE_DEBOUNCE_MS: 3000
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
  const generateId = () => TextUtils.generateId()

  const generateChatTitle = () => {
    const userMessages = messages.value.filter(msg => msg.role === 'user')
    if (userMessages.length > 0) {
      const firstMessage = userMessages[0].content
      return TextUtils.truncate(firstMessage, 50)
    }
    return 'New Chat'
  }

  const getLastMessage = (chat: Chat) => {
    const lastMsg = chat.messages[chat.messages.length - 1]
    if (!lastMsg) return 'No messages'
    return TextUtils.truncate(lastMsg.content, 60)
  }

  const formatDate = (dateString: string) => {
    return DateUtils.formatRelative(dateString)
  }

  // Persistence
  const saveToStorage = () => {
    ChatStorage.saveChatHistory(chatHistory.value)
  }

  const loadFromStorage = () => {
    const loaded = ChatStorage.loadChatHistory([])
    chatHistory.value = loaded || []
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
      
      // Create API request
      const request = chatAPI.createRequest(
        userMessage, 
        conversationId.value!, 
        selectedModel.value || undefined
      )

      // Add assistant message placeholder
      const assistantMessage = chatAPI.createLoadingMessage(generateId())
      messages.value.push(assistantMessage)

      const assistantIndex = messages.value.length - 1
      let responseContent = ''
      isTyping.value = false

      // Handle tool starts
      const onToolStart = (toolData: any) => {
        if (!messages.value[assistantIndex].tools) {
          messages.value[assistantIndex].tools = []
        }
        
        messages.value[assistantIndex].tools!.push(toolData)
        
        // Auto-expand thinking section on first tool
        if (messages.value[assistantIndex].tools!.length === 1) {
          messages.value[assistantIndex].thinkingExpanded = true
        }
      }

      // Handle tool ends
      const onToolEnd = (_toolName: string, chartSvg?: string) => {
        if (chartSvg) {
          // Add chart to the charts array
          if (!messages.value[assistantIndex].charts) {
            messages.value[assistantIndex].charts = []
          }
          messages.value[assistantIndex].charts!.push(chartSvg)
        }
      }

      // Handle content chunks
      const onChunk = (content: string) => {
        responseContent += content
        messages.value[assistantIndex].content = responseContent
      }

      // Send message via API
      await chatAPI.sendMessage(
        request,
        onToolStart,
        onToolEnd,
        onChunk,
        abortController.value.signal
      )
      
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
      charts: msg.charts || [],
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
          charts: msg.charts || [],
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

  const debouncedSaveChat = TextUtils.debounce(saveCurrentChat, CONFIG.SAVE_DEBOUNCE_MS)

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
      charts: message.charts || [],
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
    const questions = [
      "What are the latest trends in artificial intelligence?",
      "How can I improve my data analysis skills?",
      "What are the best practices for market research?",
      "How do I create effective data visualizations?",
      "What are the emerging technologies in renewable energy?"
    ]
    return questions[Math.floor(Math.random() * questions.length)]
  }

  // Initialize
  const initialize = () => {
    loadFromStorage()
    if (chatHistory.value.length === 0) {
      // Add sample chats for UI testing
      chatHistory.value = [
        {
          _id: 'sample-1',
          title: 'Market Research Analysis',
          messages: [
            { 
              id: '1', 
              role: 'user', 
              content: 'What are the current trends in renewable energy markets?',
              timestamp: new Date(Date.now() - 60000).toISOString(),
              tools: [],
              charts: [],
              thinkingExpanded: false
            },
            { 
              id: '2', 
              role: 'assistant', 
              content: 'The renewable energy market is experiencing significant growth with several key trends:\n\n1. Solar energy continues to dominate with decreasing costs\n2. Wind energy adoption is accelerating globally\n3. Energy storage solutions are becoming more affordable\n4. Green hydrogen is emerging as a key technology\n5. Policy support is driving market expansion\n\nThese trends vary by region and are influenced by local policies and market conditions.',
              timestamp: new Date(Date.now() - 30000).toISOString(),
              tools: [],
              charts: [],
              thinkingExpanded: false
            }
          ],
          conversationId: uuidv4(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 30000).toISOString()
        },
        {
          _id: 'sample-2',
          title: 'Technology Trends',
          messages: [
            { 
              id: '3', 
              role: 'user', 
              content: 'What are the emerging technologies in artificial intelligence?',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              tools: [],
              charts: [],
              thinkingExpanded: false
            },
            { 
              id: '4', 
              role: 'assistant', 
              content: 'Emerging AI technologies include:\n\n1. Large Language Models (LLMs) with improved reasoning\n2. Multimodal AI systems combining text, image, and audio\n3. Edge AI for real-time processing\n4. AI-powered automation and robotics\n5. Explainable AI for transparency\n6. Federated learning for privacy-preserving AI\n\nThese technologies are rapidly evolving and finding applications across various industries.',
              timestamp: new Date(Date.now() - 3300000).toISOString(),
              tools: [],
              charts: [],
              thinkingExpanded: false
            }
          ],
          conversationId: uuidv4(),
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3300000).toISOString()
        },
        {
          _id: 'sample-3',
          title: 'Data Analysis',
          messages: [
            { 
              id: '5', 
              role: 'user', 
              content: 'How can I analyze customer satisfaction data effectively?',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              tools: [],
              charts: [],
              thinkingExpanded: false
            },
            { 
              id: '6', 
              role: 'assistant', 
              content: 'Effective customer satisfaction analysis involves:\n\n1. Collecting data through surveys, reviews, and feedback\n2. Using sentiment analysis to understand emotions\n3. Creating visualizations to identify patterns\n4. Segmenting customers by demographics or behavior\n5. Tracking satisfaction trends over time\n6. Correlating satisfaction with business metrics\n\nThis approach helps identify areas for improvement and measure the impact of changes.',
              timestamp: new Date(Date.now() - 7000000).toISOString(),
              tools: [],
              charts: [],
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