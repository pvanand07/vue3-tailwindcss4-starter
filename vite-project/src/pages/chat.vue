<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useChatStore } from '../stores/chat'
import { useUIStore } from '../stores/ui'
import ChatSidebar from '../components/layout/ChatSidebar.vue'
import ChatMessage from '../components/features/chat/ChatMessage.vue'
import ChatInput from '../components/features/chat/ChatInput.vue'
import EmptyState from '../components/features/chat/EmptyState.vue'
import FloatingControls from '../components/features/chat/FloatingControls.vue'
import LoadingIndicator from '../components/features/chat/LoadingIndicator.vue'

// Use Pinia stores
const chatStore = useChatStore()
const uiStore = useUIStore()

// Template refs
const chatMessages = ref<HTMLElement | null>(null)
const chatInput = ref<InstanceType<typeof ChatInput> | null>(null)

// Core functions
const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessages.value) {
      requestAnimationFrame(() => {
        chatMessages.value!.scrollTop = chatMessages.value!.scrollHeight
      })
    }
  })
}

// Chat management functions
const startNewChat = () => {
  chatStore.startNewChat()
  uiStore.handleChatNavigation() // Auto-close sidebar on mobile
  scrollToBottom()
}

const onChatLoaded = () => {
  scrollToBottom()
}

const toggleThinking = (messageIndex: number) => {
  chatStore.toggleThinking(messageIndex)
}

// Calculate cumulative chart offset for each message
const calculateChartOffset = (messageIndex: number): number => {
  let offset = 0
  for (let i = 0; i < messageIndex; i++) {
    const message = chatStore.messages[i]
    if (message.charts && message.charts.length > 0) {
      offset += message.charts.length
    }
  }
  return offset
}

// Message handling functions
const handleSendMessage = async (message: string) => {
  chatStore.errorMessage = ''
  
  // Add user message
  chatStore.addMessage({
    role: 'user',
    content: message
  })

  chatStore.isTyping = true
  chatStore.isLoading = true

  scrollToBottom()
  
  // Send message to API
  await chatStore.sendMessageToAPI(message)
  scrollToBottom()
}

const copyMessage = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

const handleFileUpload = (file: File) => {
  console.log('File selected:', file)
}

const generateThought = () => {
  chatStore.isThinking = true
  setTimeout(() => {
    if (chatInput.value) {
      chatInput.value.setInputValue("Let me think about this... What would be a good question to ask?")
    }
    chatStore.isThinking = false
  }, 2000)
}

const generateQuickQuestion = () => {
  const question = chatStore.generateQuickQuestion()
  if (chatInput.value) {
    chatInput.value.setInputValue(question)
    chatInput.value.focus()
  }
  scrollToBottom()
}

// Lifecycle
onMounted(() => {
  chatStore.initialize()
  uiStore.initialize()
})

onUnmounted(() => {
  uiStore.cleanup()
})
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Chat Sidebar -->
    <ChatSidebar 
      :is-open="uiStore.sidebarOpen" 
      @close="uiStore.closeSidebar"
      @chat-loaded="onChatLoaded"
    />

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col transition-all duration-300" :class="{ 'md:ml-80': uiStore.sidebarOpen }">
      <!-- Floating Controls -->
      <FloatingControls 
        :sidebar-open="uiStore.sidebarOpen"
        :selected-model="chatStore.selectedModel"
        @toggle-sidebar="uiStore.toggleSidebar"
        @start-new-chat="startNewChat"
        @update:selected-model="chatStore.selectedModel = $event"
      />

      <!-- Chat Messages -->
      <main ref="chatMessages" class="flex-1 overflow-y-auto p-2 sm:p-4 md:p-8 scrollbar-thin pt-14">
        <div class="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6 transition-all duration-300" :class="{ 'md:max-w-6xl': !uiStore.sidebarOpen }">
          <!-- Current Chat Title -->
          <div v-if="chatStore.currentChatTitle && chatStore.messages.length > 1" class="text-center mb-6">
            <h1 class="text-xl sm:text-2xl font-semibold text-slate-700">{{ chatStore.currentChatTitle }}</h1>
          </div>

          <!-- Empty State -->
          <EmptyState v-if="!chatStore.hasUserMessages" />

          <!-- Message Loop -->
          <ChatMessage 
            v-for="(message, index) in chatStore.messages" 
            :key="message.id"
            :message="message"
            :message-index="index"
            :chart-offset="calculateChartOffset(index)"
            @toggle-thinking="toggleThinking"
            @copy-message="copyMessage"
            @cancel-request="chatStore.cancelRequest"
          />
          
          <!-- Loading Indicator -->
          <LoadingIndicator :is-visible="chatStore.isTyping" />
        </div>
      </main>

      <!-- Chat Input -->
      <ChatInput 
        ref="chatInput"
        :sidebar-open="uiStore.sidebarOpen"
        :error-message="chatStore.errorMessage"
        :is-loading="chatStore.isLoading"
        :is-thinking="chatStore.isThinking"
        :selected-model="chatStore.selectedModel"
        @send-message="handleSendMessage"
        @file-upload="handleFileUpload"
        @generate-thought="generateThought"
        @update:selected-model="chatStore.selectedModel = $event"
        @cancel-request="chatStore.cancelRequest"
      />
    </div>
  </div>
</template>