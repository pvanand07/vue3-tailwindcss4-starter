<template>
  <Transition name="modal">
    <div v-if="isVisible" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        @click="$emit('close')"
      ></div>
      
      <!-- Modal -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white px-6 py-4 shadow-xl transition-all">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Upload PDF Document</h3>
            <button
              @click="$emit('close')"
              class="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Upload Area -->
          <div
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="handleDrop"
            class="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
            :class="{
              'border-blue-400 bg-blue-50': isDragOver,
              'border-gray-300': !isDragOver
            }"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".pdf"
              @change="handleFileSelect"
              class="hidden"
            />
            
            <div v-if="!selectedFile" class="space-y-2">
              <Upload class="mx-auto h-8 w-8 text-gray-400" />
              <div>
                <button
                  @click="triggerFileSelect"
                  class="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Choose a PDF file
                </button>
                <p class="text-gray-500">or drag and drop it here</p>
              </div>
              <p class="text-xs text-gray-400">PDF files only, max 50MB</p>
            </div>

            <div v-else class="space-y-2">
              <FileText class="mx-auto h-8 w-8 text-green-500" />
              <p class="font-medium text-gray-900">{{ selectedFile.name }}</p>
              <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
              <button
                @click="clearFile"
                class="text-red-600 hover:text-red-500 text-sm font-medium"
              >
                Remove file
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Upload Progress -->
          <div v-if="isUploading" class="mt-4">
            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Uploading...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${uploadProgress}%` }"
              ></div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="$emit('close')"
              :disabled="isUploading"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="handleUpload"
              :disabled="!selectedFile || isUploading"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <span v-if="isUploading">Uploading...</span>
              <span v-else>Upload</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Upload, FileText } from 'lucide-vue-next'
import { useDocumentStore } from '../../../stores/document'
import { useChatStore } from '../../../stores/chat'

interface Props {
  isVisible: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'upload-success', docId: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const documentStore = useDocumentStore()
const chatStore = useChatStore()

// Local state
const selectedFile = ref<File | null>(null)
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const error = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// File validation
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = ['application/pdf']

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    validateAndSetFile(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files[0]) {
    validateAndSetFile(files[0])
  }
}

const validateAndSetFile = (file: File) => {
  error.value = null
  
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    error.value = 'Please select a PDF file only.'
    return
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    error.value = 'File size must be less than 50MB.'
    return
  }
  
  selectedFile.value = file
}

const clearFile = () => {
  selectedFile.value = null
  error.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleUpload = async () => {
  if (!selectedFile.value || !chatStore.userId) return
  
  isUploading.value = true
  uploadProgress.value = 0
  error.value = null
  
  try {
    const formData = new FormData()
    formData.append('user_id', chatStore.userId)
    formData.append('file', selectedFile.value)
    
    // Simulate progress (since we can't track real progress with fetch)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 10
      }
    }, 200)
    
    const response = await fetch('https://api4iresearcher-v5-1.elevatics.site/api/v1/upload-pdf/', {
      method: 'POST',
      body: formData
    })
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }
    
    const result = await response.json()
    
    // Emit success event with document ID
    emit('upload-success', result.doc_id)
    
    // Reset form
    clearFile()
    isUploading.value = false
    uploadProgress.value = 0
    
    // Close modal
    emit('close')
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Upload failed. Please try again.'
    isUploading.value = false
    uploadProgress.value = 0
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
