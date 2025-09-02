<template>
  <!-- Floating Input Box -->
  <footer class="p-2 sm:p-4 w-full">
    <div class="max-w-4xl mx-auto transition-all duration-300" :class="{ 'md:max-w-6xl': !sidebarOpen }">
      <div class="bg-white border border-slate-200 rounded-xl shadow-lg p-2 sm:p-3">
        <!-- Error Message -->
        <div v-if="errorMessage" class="text-red-500 text-sm mb-2" role="alert">
          {{ errorMessage }}
        </div>
        
        <!-- Attached Image Preview -->
        <div v-if="attachedImage" class="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
          <div class="flex items-start gap-3">
            <div class="relative">
              <img 
                :src="attachedImage.preview" 
                :alt="attachedImage.name"
                class="w-16 h-16 object-cover rounded-md border border-slate-300"
              />
              <button
                @click="removeAttachedImage"
                class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-700 truncate">{{ attachedImage.name }}</p>
              <p class="text-xs text-slate-500">{{ formatFileSize(attachedImage.size) }}</p>
            </div>
          </div>
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
                placeholder="Ask me anything about research, data analysis, or market trends..."
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
              <!-- Left: Image Upload, Think, Model -->
              <div class="flex items-center gap-2">
                <button type="button" class="flex items-center gap-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md px-3 py-1.5 flex-shrink-0 transition-colors" aria-label="Attach image">
                  <input 
                    type="file" 
                    @change="handleImageUpload" 
                    class="hidden" 
                    id="image-upload" 
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    ref="imageInput"
                  >
                  <label for="image-upload" class="cursor-pointer flex items-center gap-2">
                    <Plus class="w-4 h-4" />
                    <span class="hidden sm:inline">Image</span>
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
                  :value="selectedModel" 
                  @change="handleModelChange"
                  class="hidden sm:block text-sm text-slate-600 bg-transparent border-0 focus:outline-none cursor-pointer hover:bg-slate-100 rounded-md px-2 py-1 max-w-48"
                  aria-label="Select AI Model"
                >
                  <option value="openai/gpt-4.1">GPT-4.1</option>
                  <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="z-ai/glm-4.5">GLM 4.5</option>
                  <option value="openai/gpt-oss-120b">GPT-OSS 120B</option>
                  <option value="x-ai/grok-code-fast-1">Grok Code Fast 1</option>
                  <option value="anthropic/claude-sonnet-4">Sonnet 4</option>
                </select>
              </div>
              
              <!-- Right: Send/Stop Button -->
              <div class="flex items-center">
                <button
                  type="submit"
                  :disabled="(!inputMessage.trim() && !attachedImage && !isLoading) || isThinking || inputMessage.length > 4000"
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

interface AttachedImage {
  file: File
  name: string
  size: number
  type: string
  preview: string
  base64: string
}

interface Props {
  sidebarOpen: boolean
  errorMessage: string
  isLoading: boolean
  isThinking: boolean
  selectedModel: string
}

interface Emits {
  (e: 'send-message', data: { message: string; imageData?: string; imageType?: string }): void
  (e: 'file-upload', file: File): void
  (e: 'generate-thought'): void
  (e: 'update:selectedModel', value: string): void
  (e: 'cancel-request'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleModelChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newModel = target.value
  console.log('🎯 ChatInput: Model changed to:', newModel)
  emit('update:selectedModel', newModel)
}

// Local state
const inputMessage = ref('')
const messageInput = ref<HTMLTextAreaElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const attachedImage = ref<AttachedImage | null>(null)

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove the data URL prefix (data:image/jpeg;base64,)
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    alert('Please select a valid image file (PNG, JPEG, WebP, or GIF)')
    return false
  }

  if (file.size > maxSize) {
    alert('Image file size must be less than 10MB')
    return false
  }

  return true
}

// Handlers
const handleSendMessage = () => {
  if ((!inputMessage.value.trim() && !attachedImage.value) || props.isLoading) {
    if (props.isLoading) {
      emit('cancel-request')
    }
    return
  }
  
  const message = inputMessage.value.trim() || 'Analyze this image'
  const imageData = attachedImage.value?.base64
  const imageType = attachedImage.value?.type
  
  // Clear inputs
  inputMessage.value = ''
  attachedImage.value = null
  if (imageInput.value) {
    imageInput.value.value = ''
  }
  
  emit('send-message', { message, imageData, imageType })
}

const handleEnterKey = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    return
  }
  event.preventDefault()
  handleSendMessage()
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (!validateImageFile(file)) {
    target.value = '' // Clear the input
    return
  }

  try {
    const base64 = await convertFileToBase64(file)
    const preview = URL.createObjectURL(file)
    
    attachedImage.value = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview,
      base64
    }
  } catch (error) {
    console.error('Error processing image:', error)
    alert('Error processing image. Please try again.')
    target.value = '' // Clear the input
  }
}

const removeAttachedImage = () => {
  if (attachedImage.value?.preview) {
    URL.revokeObjectURL(attachedImage.value.preview)
  }
  attachedImage.value = null
  if (imageInput.value) {
    imageInput.value.value = ''
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