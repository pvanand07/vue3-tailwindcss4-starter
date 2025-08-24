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
import ReferenceModal from '../components/features/chat/ReferenceModal.vue'
import type { Reference } from '../types/chat'

// Use Pinia stores
const chatStore = useChatStore()
const uiStore = useUIStore()

// Template refs
const chatMessages = ref<HTMLElement | null>(null)
const chatInput = ref<InstanceType<typeof ChatInput> | null>(null)

// Reference modal state
const isReferenceModalOpen = ref(false)
const selectedReference = ref<Reference | null>(null)

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

// Reference handling functions
const handleReferenceClick = (reference: Reference) => {
  selectedReference.value = reference
  isReferenceModalOpen.value = true
}

const closeReferenceModal = () => {
  isReferenceModalOpen.value = false
  selectedReference.value = null
}

const handleReferenceCopyContent = (message: string) => {
  console.log(message) // You can replace this with a toast notification
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
        :selected-model="chatStore.selectedModel || 'openai/gpt-4.1-mini'"
        @toggle-sidebar="uiStore.toggleSidebar"
        @start-new-chat="startNewChat"
        @update:selected-model="(model) => { console.log('🎯 FloatingControls - Model updated to:', model); chatStore.selectedModel = model }"
      />

      <!-- Chat Messages -->
      <main ref="chatMessages" class="flex-1 overflow-y-auto p-2 sm:p-4 md:p-8 scrollbar-thin pt-14">
        <div class="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6 transition-all duration-300" :class="{ 'md:max-w-6xl': !uiStore.sidebarOpen }">
          <!-- D Code Title -->
          <div v-if="chatStore.messages.length > 1" class="text-center mb-6">
            <h1 class="text-xl sm:text-2xl font-semibold text-slate-700">D Code</h1>
          </div>

          <!-- Empty State -->
          <EmptyState 
            v-if="!chatStore.hasUserMessages"
            :selected-states="chatStore.selectedStates"
            :selected-codes="chatStore.selectedCodes"
            :selected-project-type="chatStore.selectedProjectType"
            :selected-site-type="chatStore.selectedSiteType"
            @update:selected-states="chatStore.selectedStates = $event"
            @update:selected-codes="chatStore.selectedCodes = $event"
            @update:selected-project-type="chatStore.selectedProjectType = $event"
            @update:selected-site-type="chatStore.selectedSiteType = $event"
            @generate-quick-question="generateQuickQuestion"
          />

          <!-- Message Loop -->
          <ChatMessage 
            v-for="(message, index) in chatStore.messages" 
            :key="message.id"
            :message="message"
            :message-index="index"
            @toggle-thinking="toggleThinking"
            @copy-message="copyMessage"
            @cancel-request="chatStore.cancelRequest"
            @reference-click="handleReferenceClick"
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
        :selected-model="chatStore.selectedModel || 'openai/gpt-4.1-mini'"
        @send-message="handleSendMessage"
        @file-upload="handleFileUpload"
        @generate-thought="generateThought"
        @update:selected-model="(model) => { console.log('🎯 ChatInput - Model updated to:', model); chatStore.selectedModel = model }"
        @cancel-request="chatStore.cancelRequest"
      />
    </div>

    <!-- Reference Modal -->
    <ReferenceModal
      :is-open="isReferenceModalOpen"
      :reference="selectedReference"
      @close="closeReferenceModal"
      @copy-content="handleReferenceCopyContent"
    />
  </div>
</template>