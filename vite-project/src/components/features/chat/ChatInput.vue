<template>
  <!-- Floating Input Box -->
  <footer class="p-2 sm:p-4 w-full">
    <div class="max-w-4xl mx-auto transition-all duration-300" :class="{ 'md:max-w-6xl': !sidebarOpen }">
      <div class="bg-white border border-slate-200 rounded-xl shadow-lg p-2 sm:p-3">
        <!-- Error Message -->
        <div v-if="errorMessage" class="text-red-500 text-sm mb-2" role="alert">
          {{ errorMessage }}
        </div>
        
        <form @submit.prevent="handleSendMessage">
          <div>
            <!-- Text Input Container -->
            <div class="relative">
              <textarea
                ref="messageInput"
                v-model="inputMessage"
                @keydown.enter="handleEnterKey"
                :disabled="isLoading"
                class="w-full bg-transparent p-2 text-slate-800 placeholder-slate-500 focus:outline-none resize-none scrollbar-thin"
                rows="1"
                placeholder="Ask me anything about sales, customer insights, or market intelligence..."
                maxlength="4000"
                aria-label="Message input"
              ></textarea>
              <!-- Floating Character Counter -->
              <div class="absolute top-2 right-2 text-xs text-slate-400 pointer-events-none" aria-live="polite">
                {{ inputMessage.length }}/4000
              </div>
            </div>
            
            <!-- Bottom Controls Row -->
            <div class="flex items-center justify-between mt-2">
              <!-- Left: Model Selection and Upload Button -->
              <div class="flex items-center gap-2">
                <select 
                  :value="selectedModel" 
                  @change="handleModelChange"
                  class="text-sm text-slate-600 bg-transparent border-0 focus:outline-none cursor-pointer hover:bg-slate-100 rounded-md px-2 py-1 max-w-48"
                  aria-label="Select AI Model"
                >
                  <option value="openai/gpt-5.2">GPT-5.2</option>
                  <option value="google/gemini-3-pro-preview">Gemini 3 Pro</option>
                  <option value="anthropic/claude-sonnet-4.5">Sonnet 4.5</option>
                </select>
                
                <!-- Upload Button -->
                <button
                  type="button"
                  @click="showUploadModal = true"
                  class="text-slate-600 hover:bg-slate-100 rounded-lg p-2 transition-colors"
                  aria-label="Upload files"
                  title="Upload files"
                >
                  <Paperclip class="w-5 h-5" />
                </button>
              </div>
              
              <!-- Right: Send/Stop Button -->
              <div class="flex items-center">
                <button
                  type="submit"
                  :disabled="(!inputMessage.trim() && !isLoading) || isThinking || inputMessage.length > 4000"
                  class="rounded-lg p-2 transition-colors flex-shrink-0"
                  :class="isLoading ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-primary text-white hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed'"
                  :aria-label="isLoading ? 'Stop generating' : 'Send message'"
                >
                  <template v-if="isLoading">
                    <div class="relative w-5 h-5 flex items-center justify-center">
                      <Square class="w-5 h-5" />
                      <div class="absolute w-2 h-2 bg-white rounded-sm"></div>
                    </div>
                  </template>
                  <template v-else>
                    <ArrowUp class="w-5 h-5" />
                  </template>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Upload Modal -->
    <DocumentUploadModal 
      :is-open="showUploadModal"
      @close="showUploadModal = false"
      @upload-success="handleUploadSuccess"
    />
  </footer>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { ArrowUp, Square, Paperclip } from 'lucide-vue-next'
import { useChatStore } from '../../../stores/chat'
import DocumentUploadModal from '../dashboard/DocumentUploadModal.vue'

interface Props {
  sidebarOpen: boolean
  errorMessage: string
  isLoading: boolean
  isThinking: boolean
  selectedModel: string
}

interface Emits {
  (e: 'send-message', message: string): void
  (e: 'update:selectedModel', value: string): void
  (e: 'cancel-request'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const chatStore = useChatStore()

const handleModelChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newModel = target.value
  console.log('🎯 ChatInput: Model changed to:', newModel)
  emit('update:selectedModel', newModel)
}

// Local state
const inputMessage = ref('')
const messageInput = ref<HTMLTextAreaElement | null>(null)
const showUploadModal = ref(false)

// Handlers
const handleSendMessage = async () => {
  // If loading, cancel the request
  if (props.isLoading) {
    emit('cancel-request')
    return
  }
  
  // Require at least a message
  if (!inputMessage.value.trim()) {
    return
  }
  
  const message = inputMessage.value.trim()
  
  // Clear input
  inputMessage.value = ''
  
  emit('send-message', message)
}

const handleEnterKey = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    return
  }
  event.preventDefault()
  handleSendMessage()
}

const handleUploadSuccess = () => {
  // Optional: Show a success notification or update UI
  console.log('✅ Files uploaded successfully')
}

// Watch for chat messages to close upload modal when chat starts
watch(() => chatStore.hasUserMessages, (hasMessages) => {
  if (hasMessages) {
    showUploadModal.value = false
  }
})

// Focus method for external use
const focus = () => {
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.focus()
    }
  })
}

// Set input value for external use
const setInputValue = (value: string) => {
  inputMessage.value = value
}

// Expose methods for parent component
defineExpose({
  focus,
  setInputValue
})
</script>