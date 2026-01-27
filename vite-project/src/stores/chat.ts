import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Thread, ChatMessage, MessageResponse } from '../types/chat'
import { chatAPI } from '../api/chat'
import { ChatStorage } from '../utils/storage'
import { DateUtils } from '../utils/date'
import { TextUtils } from '../utils/text'

export const useChatStore = defineStore('chat', () => {
  // State
  const messages = ref<ChatMessage[]>([])
  const threads = ref<Thread[]>([])
  const currentThreadId = ref<string | null>(null)
  const currentThreadTitle = ref('')
  const isLoading = ref(false)
  const isTyping = ref(false)
  const isThinking = ref(false)
  const errorMessage = ref('')
  const abortController = ref<AbortController | null>(null)
  const selectedModel = ref('openai/gpt-5.2')
  const userLocation = ref<{ country: string; details: string } | null>(null)
  const userId = ref<string | null>(null)
  const isLoadingThreads = ref(false)
  const isLoadingMessages = ref(false)

  // Caching system
  const messagesCache = new Map<string, ChatMessage[]>()
  const cacheTimestamps = new Map<string, number>()
  const preloadingThreads = new Set<string>() // Track threads being preloaded
  const CACHE_MAX_AGE_MS = 5 * 60 * 1000 // 5 minutes cache validity
  const MAX_CACHE_SIZE = 50 // Maximum number of threads to cache

  // Computed
  const hasUserMessages = computed(() => {
    return messages.value.some(msg => msg.role === 'user')
  })

  const currentThread = computed(() => {
    return threads.value.find(thread => thread.id === currentThreadId.value)
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

  const getLastMessage = (thread: Thread) => {
    // Find messages for this thread
    const threadMessages = messages.value.filter(msg => msg.thread_id === thread.id)
    if (threadMessages.length === 0) return 'No messages'
    const lastMsg = threadMessages[threadMessages.length - 1]
    return TextUtils.truncate(lastMsg.content, 60)
  }

  const formatDate = (dateString: string) => {
    return DateUtils.formatRelative(dateString)
  }

  // API Functions - Thread Management
  const loadThreads = async () => {
    if (!userId.value) {
      console.warn('Cannot load threads: userId not set')
      return
    }

    // Load from cache first and display immediately
    const cached = ChatStorage.loadThreadsCache(userId.value)
    if (cached && cached.threads) {
      threads.value = cached.threads
      console.log('📦 Loaded threads from cache:', threads.value.length)
    }

    // Then fetch from API in the background
    isLoadingThreads.value = true
    try {
      const response = await chatAPI.listThreads(userId.value)
      threads.value = response.threads
      
      // Save to cache after successful API fetch
      ChatStorage.saveThreadsCache(userId.value, response.threads)
      
      console.log('✅ Loaded threads from API:', threads.value.length)
    } catch (error) {
      console.error('Failed to load threads:', error)
      errorMessage.value = 'Failed to load chat history'
      
      // If we have cached data, keep it even if API fails
      if (!cached || !cached.threads || cached.threads.length === 0) {
        threads.value = []
      }
    } finally {
      isLoadingThreads.value = false
    }
  }

  // Convert API messages to ChatMessage format
  const convertMessages = (apiMessages: MessageResponse[]): ChatMessage[] => {
    return apiMessages.map((msg: MessageResponse) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      thread_id: msg.thread_id,
      created_at: msg.created_at,
      timestamp: msg.created_at,
      tools: msg.tool_events?.filter(e => e.type === 'tool_start').map(e => ({
        name: e.name,
        input: typeof e.input === 'string' ? e.input : JSON.stringify(e.input),
        reasoning: ''
      })) || [],
      tool_events: msg.tool_events || [],
      thinkingExpanded: false,
      isLoading: false
    }))
  }

  // Save messages to cache (both in-memory and localStorage)
  const saveToCache = (threadId: string, messages: ChatMessage[]) => {
    // Enforce cache size limit (LRU-like: remove oldest entries)
    if (messagesCache.size >= MAX_CACHE_SIZE && !messagesCache.has(threadId)) {
      // Remove oldest cache entry
      let oldestThreadId = ''
      let oldestTimestamp = Infinity
      for (const [id, timestamp] of cacheTimestamps.entries()) {
        if (timestamp < oldestTimestamp) {
          oldestTimestamp = timestamp
          oldestThreadId = id
        }
      }
      if (oldestThreadId) {
        messagesCache.delete(oldestThreadId)
        cacheTimestamps.delete(oldestThreadId)
        ChatStorage.removeMessagesCache(oldestThreadId)
        console.log('🗑️ Removed oldest cache entry:', oldestThreadId)
      }
    }

    // Save to in-memory cache
    messagesCache.set(threadId, messages)
    cacheTimestamps.set(threadId, Date.now())
    
    // Save to localStorage cache
    ChatStorage.saveMessagesCache(threadId, messages)
    
    console.log('💾 Cached messages for thread:', threadId, `(${messages.length} messages)`)
  }

  // Get messages from cache (check localStorage first, then in-memory)
  const getFromCache = (threadId: string): ChatMessage[] | null => {
    // First check in-memory cache
    const inMemoryCached = messagesCache.get(threadId)
    const inMemoryTimestamp = cacheTimestamps.get(threadId)

    if (inMemoryCached && inMemoryTimestamp) {
      const age = Date.now() - inMemoryTimestamp
      if (age <= CACHE_MAX_AGE_MS) {
        console.log('✅ In-memory cache hit for thread:', threadId, `(age: ${Math.round(age / 1000)}s)`)
        return [...inMemoryCached] // Return a copy to prevent mutations
      }
    }

    // Check localStorage cache
    const localStorageCached = ChatStorage.loadMessagesCache(threadId)
    if (localStorageCached && localStorageCached.messages && localStorageCached.timestamp) {
      const age = Date.now() - localStorageCached.timestamp
      if (age <= CACHE_MAX_AGE_MS) {
        // Restore to in-memory cache
        const messages = localStorageCached.messages as ChatMessage[]
        messagesCache.set(threadId, messages)
        cacheTimestamps.set(threadId, localStorageCached.timestamp)
        console.log('✅ LocalStorage cache hit for thread:', threadId, `(age: ${Math.round(age / 1000)}s)`)
        return [...messages] // Return a copy to prevent mutations
      } else {
        // Cache expired, remove it
        console.log('⏰ LocalStorage cache expired for thread:', threadId, `(age: ${Math.round(age / 1000)}s)`)
        ChatStorage.removeMessagesCache(threadId)
      }
    }

    return null
  }

  const loadThreadMessages = async (threadId: string, useCache: boolean = true, showCacheFirst: boolean = false) => {
    if (!userId.value) {
      console.warn('Cannot load messages: userId not set')
      return
    }

    // Check cache first if enabled
    if (useCache) {
      const cached = getFromCache(threadId)
      if (cached) {
        if (showCacheFirst) {
          // Show cache immediately, then refresh in background
          messages.value = cached
          console.log('⚡ Showing cached messages immediately:', cached.length)
        } else {
          // Return early if we have valid cache and not forcing refresh
          messages.value = cached
          return
        }
      }
    }

    // Fetch from API (either because no cache, or refreshing in background)
    isLoadingMessages.value = true
    try {
      const response = await chatAPI.getThreadMessages(threadId, userId.value)
      
      // Convert API messages to ChatMessage format
      const convertedMessages = convertMessages(response.messages)
      messages.value = convertedMessages
      
      // Save to cache
      saveToCache(threadId, convertedMessages)
      
      console.log('✅ Loaded messages from API:', messages.value.length)
    } catch (error) {
      console.error('Failed to load thread messages:', error)
      errorMessage.value = 'Failed to load messages'
      
      // If we showed cache first and API fails, keep the cached messages
      if (showCacheFirst && useCache) {
        const cached = getFromCache(threadId)
        if (cached) {
          messages.value = cached
          console.log('⚠️ API failed, keeping cached messages')
        }
      }
    } finally {
      isLoadingMessages.value = false
    }
  }

  // User ID management
  const setUserId = (newUserId: string) => {
    userId.value = newUserId
    ChatStorage.saveUserPreferences({ userId: newUserId, selectedModel: selectedModel.value })
    // Load threads after setting user ID
    loadThreads()
  }

  const loadUserId = () => {
    const preferences = ChatStorage.loadUserPreferences({})
    userId.value = preferences?.userId || null
    if (preferences?.selectedModel) {
      console.log('📖 Loading saved model preference:', preferences.selectedModel)
      selectedModel.value = preferences.selectedModel
    }
  }

  // Model management
  const setSelectedModel = (model: string) => {
    console.log('🔄 Model selection changed:', {
      from: selectedModel.value,
      to: model,
      timestamp: new Date().toISOString()
    })
    selectedModel.value = model
    ChatStorage.saveUserPreferences({ 
      userId: userId.value, 
      selectedModel: model 
    })
  }

  // Geolocation
  const getUserLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            if (data.address) {
              userLocation.value = {
                country: data.address.country || '',
                details: `${data.address.city || data.address.town || data.address.village || ''}, ${
                  data.address.state || ''
                }`
              }
            }
          } catch (error) {
            console.error('Error fetching location details:', error)
          }
        },
        error => {
          console.error('Error getting user location:', error)
        }
      )
    } else {
      console.error('Geolocation is not supported by this browser.')
    }
  }

  // API Functions
  const sendMessageToAPI = async (userMessage: string) => {
    console.log('🎬 sendMessageToAPI called with:', userMessage.substring(0, 50))
    
    if (!userId.value) {
      console.error('❌ No user ID set')
      errorMessage.value = 'Please set a user ID first'
      return
    }

    // Add assistant message placeholder before try block so it's accessible in catch
    const assistantMessage = chatAPI.createLoadingMessage(generateId())
    messages.value.push(assistantMessage)
    const assistantIndex = messages.value.length - 1

    try {
      abortController.value = new AbortController()

      console.log('🚀 Creating API request:', {
        selectedModel: selectedModel.value,
        threadId: currentThreadId.value || 'new thread',
        userId: userId.value,
        timestamp: new Date().toISOString()
      })
      
      const request = chatAPI.createRequest(
        userMessage,
        currentThreadId.value,
        userId.value,
        selectedModel.value || undefined
      )
      
      console.log('📤 Final API request payload:', JSON.stringify(request, null, 2))

      let responseContent = ''
      isTyping.value = false

      // Handle tool starts
      const onToolStart = (toolData: any) => {
        console.log('🔧 Tool start callback:', toolData)
        if (!messages.value[assistantIndex].tools) {
          messages.value[assistantIndex].tools = []
        }
        messages.value[assistantIndex].tools!.push(toolData)
        // Set current loading tool name
        messages.value[assistantIndex].currentLoadingTool = toolData.name
      }

      // Handle tool ends
      const onToolEnd = (toolName: string, output?: string, artifactsData?: any) => {
        console.log('✅ Tool end callback:', toolName, artifactsData ? 'with artifacts' : '')
        
        // Store tool_end event with artifacts_data
        if (!messages.value[assistantIndex].tool_events) {
          messages.value[assistantIndex].tool_events = []
        }
        messages.value[assistantIndex].tool_events!.push({
          type: 'tool_end',
          name: toolName,
          output: output,
          artifacts_data: artifactsData
        })
      }

      // Handle content chunks
      const onChunk = (content: string) => {
        console.log('💬 Chunk callback:', content)
        responseContent += content
        messages.value[assistantIndex].content = responseContent
        // Clear loading tool when first chunk arrives
        if (messages.value[assistantIndex].currentLoadingTool) {
          messages.value[assistantIndex].currentLoadingTool = undefined
        }
      }

      console.log('🚀 Starting API call...')
      
      // Send message via API
      await chatAPI.sendMessage(
        request,
        onToolStart,
        onToolEnd,
        onChunk,
        abortController.value.signal
      )
      
      console.log('✅ API call completed')

      messages.value[assistantIndex].isLoading = false

      // Update cache with new messages if we have a thread
      if (currentThreadId.value) {
        saveToCache(currentThreadId.value, [...messages.value])
      }

      // Reload threads to get the newly created thread (if this was first message)
      if (!currentThreadId.value) {
        await loadThreads()
        // Try to find the new thread and set it as current
        if (threads.value.length > 0) {
          currentThreadId.value = threads.value[0].id
          currentThreadTitle.value = threads.value[0].title || generateChatTitle()
          // Cache the messages for the new thread
          saveToCache(currentThreadId.value, [...messages.value])
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('⚠️ Request aborted')
      } else {
        console.error('❌ Error in sendMessageToAPI:', error)
        console.error('❌ Error stack:', error.stack)
        errorMessage.value = `Error: ${error.message}`
        
        // Remove loading message on error
        if (messages.value[assistantIndex]) {
          messages.value[assistantIndex].isLoading = false
          messages.value[assistantIndex].content = 'Error: Failed to get response'
        }
      }
    } finally {
      console.log('🏁 Finally block - cleaning up')
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
    console.log('🆕 Starting new chat:', {
      previousThreadId: currentThreadId.value,
      messageCount: messages.value.length
    })

    currentThreadId.value = null
    currentThreadTitle.value = ''
    messages.value = []
    errorMessage.value = ''

    console.log('✅ New chat started')
  }

  const loadThread = async (thread: Thread, forceRefresh: boolean = false) => {
    console.log('🔄 Loading thread:', {
      threadId: thread.id,
      threadTitle: thread.title,
      currentThreadId: currentThreadId.value,
      forceRefresh
    })

    currentThreadId.value = thread.id
    currentThreadTitle.value = thread.title || 'Untitled'

    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = getFromCache(thread.id)
      if (cached) {
        // Show cached messages immediately
        messages.value = cached
        console.log('⚡ Loaded from cache (instant):', {
          currentThreadId: currentThreadId.value,
          messagesLoaded: messages.value.length
        })
        
        // Refresh in background to ensure we have latest data
        loadThreadMessages(thread.id, true, true).catch(err => {
          console.warn('Background refresh failed:', err)
        })
        return
      }
    }

    // No cache available, load from API (cache will be updated automatically)
    await loadThreadMessages(thread.id, true, false)

    console.log('✅ Thread loaded successfully:', {
      currentThreadId: currentThreadId.value,
      messagesLoaded: messages.value.length
    })
  }

  const deleteThread = async (threadId: string) => {
    if (!userId.value) return

    try {
      await chatAPI.deleteThread(threadId, userId.value)
      
      // Remove from local state
      threads.value = threads.value.filter(t => t.id !== threadId)

      // Update threads cache
      ChatStorage.saveThreadsCache(userId.value, threads.value)

      // Clear from cache (both in-memory and localStorage)
      messagesCache.delete(threadId)
      cacheTimestamps.delete(threadId)
      preloadingThreads.delete(threadId)
      ChatStorage.removeMessagesCache(threadId)

      // If we deleted the current thread, start a new one
      if (currentThreadId.value === threadId) {
        startNewChat()
      }
      
      console.log('✅ Thread deleted:', threadId)
    } catch (error) {
      console.error('Failed to delete thread:', error)
      errorMessage.value = 'Failed to delete chat'
    }
  }

  const renameThread = async (threadId: string, newTitle: string) => {
    if (!userId.value) return

    try {
      const updatedThread = await chatAPI.renameThread(threadId, userId.value, newTitle)
      
      // Update local state
      const threadIndex = threads.value.findIndex(t => t.id === threadId)
      if (threadIndex !== -1) {
        threads.value[threadIndex] = updatedThread
      }

      // Update threads cache
      ChatStorage.saveThreadsCache(userId.value, threads.value)

      // Update current title if this is the current thread
      if (currentThreadId.value === threadId) {
        currentThreadTitle.value = newTitle
      }
      
      console.log('✅ Thread renamed:', threadId)
    } catch (error) {
      console.error('Failed to rename thread:', error)
      errorMessage.value = 'Failed to rename chat'
    }
  }

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date().toISOString(),
      thread_id: currentThreadId.value || undefined,
      tools: message.tools || [],
      thinkingExpanded: message.thinkingExpanded || false
    }

    messages.value.push(newMessage)

    // Update cache if we have a thread
    if (currentThreadId.value) {
      saveToCache(currentThreadId.value, [...messages.value])
    }

    // Generate title if this is the first user message
    if (!currentThreadTitle.value && message.role === 'user' && messages.value.filter(m => m.role === 'user').length === 1) {
      currentThreadTitle.value = generateChatTitle()
    }

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
      "What are the latest trends in sales technology?",
      "How can I improve my sales performance?",
      "What are the best practices for customer relationship management?",
      "How do I analyze sales data effectively?",
      "What are the emerging trends in sales intelligence?"
    ]
    return questions[Math.floor(Math.random() * questions.length)]
  }

  // Preload messages for threads (background preloading)
  const preloadThreads = async (threadIds: string[] = [], maxConcurrent: number = 3) => {
    if (!userId.value) {
      console.warn('Cannot preload threads: userId not set')
      return
    }

    const currentUserId = userId.value // Store in local variable to satisfy type checker

    // Use provided thread IDs or default to all threads
    const threadsToPreload = threadIds.length > 0 
      ? threadIds 
      : threads.value.map(t => t.id)

    // Filter out threads that are already cached or being preloaded
    const threadsToLoad = threadsToPreload.filter(threadId => {
      if (preloadingThreads.has(threadId)) {
        return false // Already preloading
      }
      const cached = getFromCache(threadId)
      if (cached) {
        return false // Already cached
      }
      return true
    })

    if (threadsToLoad.length === 0) {
      console.log('📦 All threads already cached or preloading')
      return
    }

    console.log(`🚀 Preloading ${threadsToLoad.length} threads...`)

    // Preload in batches to avoid overwhelming the API
    for (let i = 0; i < threadsToLoad.length; i += maxConcurrent) {
      const batch = threadsToLoad.slice(i, i + maxConcurrent)
      
      await Promise.allSettled(
        batch.map(async (threadId) => {
          preloadingThreads.add(threadId)
          try {
            const response = await chatAPI.getThreadMessages(threadId, currentUserId)
            const convertedMessages = convertMessages(response.messages)
            saveToCache(threadId, convertedMessages)
            console.log(`✅ Preloaded thread: ${threadId} (${convertedMessages.length} messages)`)
          } catch (error) {
            console.warn(`⚠️ Failed to preload thread ${threadId}:`, error)
          } finally {
            preloadingThreads.delete(threadId)
          }
        })
      )

      // Small delay between batches to avoid rate limiting
      if (i + maxConcurrent < threadsToLoad.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log('✅ Preloading complete')
  }

  // Clear cache (useful for debugging or forced refresh)
  const clearCache = (threadId?: string) => {
    if (threadId) {
      messagesCache.delete(threadId)
      cacheTimestamps.delete(threadId)
      ChatStorage.removeMessagesCache(threadId)
      console.log('🗑️ Cleared cache for thread:', threadId)
    } else {
      messagesCache.clear()
      cacheTimestamps.clear()
      // Note: Clearing all localStorage message caches would require iterating through all keys
      // For now, we'll just clear in-memory cache. Individual thread caches will expire naturally.
      console.log('🗑️ Cleared all in-memory cache')
    }
  }

  // Initialize
  const initialize = () => {
    console.log('🎬 Store initializing...')
    loadUserId()
    console.log('👤 User ID after load:', userId.value)
    getUserLocation()
    
    // Load threads if user ID is set
    if (userId.value) {
      console.log('📂 Loading threads for user:', userId.value)
      loadThreads()
    } else {
      console.warn('⚠️ No user ID found, threads will not be loaded')
    }
    
    startNewChat()
    console.log('✅ Store initialized')
  }

  return {
    // State
    messages,
    threads,
    currentThreadId,
    currentThreadTitle,
    isLoading,
    isTyping,
    isThinking,
    errorMessage,
    abortController,
    selectedModel,
    userLocation,
    userId,
    isLoadingThreads,
    isLoadingMessages,

    // Computed
    hasUserMessages,
    currentThread,

    // Utils
    getLastMessage,
    formatDate,

    // Actions
    startNewChat,
    loadThread,
    loadThreads,
    loadThreadMessages,
    deleteThread,
    renameThread,
    addMessage,
    updateMessage,
    toggleThinking,
    generateQuickQuestion,
    sendMessageToAPI,
    cancelRequest,
    initialize,
    setUserId,
    loadUserId,
    setSelectedModel,
    preloadThreads,
    clearCache
  }
})