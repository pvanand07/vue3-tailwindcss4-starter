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
                placeholder="Ask anything..."
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
              <!-- Left: File Upload, Think, Model -->
              <div class="flex items-center gap-2">
                <button type="button" class="flex items-center gap-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md px-3 py-1.5 flex-shrink-0 transition-colors" aria-label="Upload file">
                  <input type="file" @change="handleFileUpload" class="hidden" id="file-upload" accept="image/*,.pdf,.txt,.doc,.docx">
                  <label for="file-upload" class="cursor-pointer flex items-center gap-2">
                    <Plus class="w-4 h-4" />
                  </label>
                </button>
                <button
                  type="button"
                  @click="$emit('generate-thought')"
                  :disabled="isThinking || isLoading"
                  class="flex items-center gap-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md px-3 py-1.5 disabled:cursor-not-allowed disabled:bg-slate-200 flex-shrink-0 transition-colors"
                  aria-label="Generate thought"
                >
                  <Lightbulb class="w-4 h-4" />
                  <span class="hidden sm:inline">Think</span>
                  <span class="sm:hidden">✨</span>
                </button>
                <select 
                  :model-value="selectedModel" 
                  @update:model-value="$emit('update:selectedModel', $event)"
                  class="hidden sm:block text-sm text-slate-600 bg-transparent border-0 focus:outline-none cursor-pointer hover:bg-slate-100 rounded-md px-2 py-1 max-w-48"
                  aria-label="Select AI Model"
                >
                  <option value="openai/gpt-4.1-mini">GPT-4.1-Mini</option>
                  <option value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                  <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="qwen/qwen3-coder:floor">Qwen3 Coder</option>
                  <option value="z-ai/glm-4.5">GLM 4.5</option>
                  <option value="">Grok 3 Mini</option>
                </select>
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
  </footer>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Plus, Lightbulb, ArrowUp, Square } from 'lucide-vue-next'

interface Props {
  sidebarOpen: boolean
  errorMessage: string
  isLoading: boolean
  isThinking: boolean
  selectedModel: string
}

interface Emits {
  (e: 'send-message', message: string): void
  (e: 'file-upload', file: File): void
  (e: 'generate-thought'): void
  (e: 'update:selectedModel', value: string): void
  (e: 'cancel-request'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local state
const inputMessage = ref('')
const messageInput = ref<HTMLTextAreaElement | null>(null)

// Handlers
const handleSendMessage = () => {
  if (!inputMessage.value.trim() || props.isLoading) {
    if (props.isLoading) {
      emit('cancel-request')
    }
    return
  }
  
  const message = inputMessage.value
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

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('file-upload', file)
  }
}

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