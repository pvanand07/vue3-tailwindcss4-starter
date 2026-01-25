<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="handleClose">
    <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <h2 class="text-xl font-semibold text-[#0F172A]">Upload Files</h2>
        <button
          @click="handleClose"
          class="text-[#64748B] hover:text-[#0F172A] transition-colors"
          aria-label="Close modal"
        >
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <!-- Upload Area -->
        <div
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
          :class="isDragging ? 'border-[#2F5BFF] bg-[#E4E9FF]' : 'border-[#E5E7EB] hover:border-[#2F5BFF]/50'"
        >
          <Upload class="w-12 h-12 mx-auto mb-4 text-[#94A3B8]" />
          <p class="text-[#475569] mb-2">
            Drag and drop files here, or
            <label class="text-[#2F5BFF] hover:text-[#1E40FF] cursor-pointer font-medium">
              browse
              <input
                ref="fileInput"
                type="file"
                multiple
                accept=".pdf,.docx,.xlsx,.xls"
                class="hidden"
                @change="handleFileSelect"
              />
            </label>
          </p>
          <p class="text-sm text-[#94A3B8]">
            Supported formats: PDF, DOCX, XLSX, XLS
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ errorMessage }}
        </div>

        <!-- Selected Files Preview -->
        <div v-if="selectedFiles.length > 0" class="mt-6">
          <h3 class="text-sm font-medium text-[#0F172A] mb-3">Selected Files ({{ selectedFiles.length }})</h3>
          <div class="space-y-2">
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="flex items-center justify-between p-3 bg-[#F1F5F9] rounded-lg border border-[#E5E7EB]"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <FileText class="w-5 h-5 text-[#94A3B8] flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-[#0F172A] truncate">{{ file.name }}</p>
                  <p class="text-xs text-[#475569]">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>
              <button
                @click="removeFile(index)"
                class="text-[#64748B] hover:text-[#EF4444] transition-colors flex-shrink-0 ml-2"
                aria-label="Remove file"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Uploaded Files with Delete -->
        <div v-if="uploadedFiles.length > 0" class="mt-6">
          <h3 class="text-sm font-medium text-[#0F172A] mb-3">Uploaded Files ({{ uploadedFiles.length }})</h3>
          <div class="space-y-2">
            <div
              v-for="file in uploadedFiles"
              :key="file.doc_id"
              class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <CheckCircle class="w-5 h-5 text-[#22C55E] flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-[#0F172A] truncate">{{ file.filename }}</p>
                  <p class="text-xs text-[#475569]">
                    <span v-if="file.file_type === 'document'">{{ file.page_count }} pages</span>
                    <span v-if="file.file_type === 'excel'">{{ file.row_count }} rows, {{ file.column_count }} columns</span>
                  </p>
                </div>
              </div>
              <!-- Delete Confirmation -->
              <div v-if="deleteConfirmId === file.doc_id" class="flex items-center space-x-1 bg-red-50 border border-red-200 rounded-md px-2 py-1 flex-shrink-0 ml-2">
                <span class="text-xs text-red-700 font-medium">Delete?</span>
                <button
                  @click="confirmDeleteFile(file.doc_id)"
                  class="text-[#EF4444] hover:text-red-700 hover:bg-red-100 rounded px-1.5 py-0.5 text-xs font-medium transition-colors"
                  title="Confirm delete"
                >
                  Yes
                </button>
                <button
                  @click="cancelDeleteFile"
                  class="text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded px-1.5 py-0.5 text-xs font-medium transition-colors"
                  title="Cancel"
                >
                  Cancel
                </button>
              </div>
              <button
                v-else
                @click="showDeleteConfirm(file.doc_id)"
                :disabled="isDeletingFile === file.doc_id"
                class="text-[#64748B] hover:text-[#EF4444] transition-colors flex-shrink-0 ml-2 disabled:opacity-50"
                aria-label="Delete file"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
        <button
          @click="handleClose"
          class="px-4 py-2 text-[#475569] hover:bg-[#F1F5F9] rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleUpload"
          :disabled="selectedFiles.length === 0 || isUploading"
          class="px-6 py-2 bg-[#2F5BFF] text-white rounded-lg hover:bg-[#1E40FF] disabled:bg-[#94A3B8] disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Upload v-if="!isUploading" class="w-4 h-4" />
          <Loader2 v-else class="w-4 h-4 animate-spin" />
          {{ isUploading ? 'Uploading...' : 'Upload Files' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X, Upload, FileText, Trash2, CheckCircle, Loader2 } from 'lucide-vue-next'
import { documentAPI } from '../../../api/document'
import { useChatStore } from '../../../stores/chat'
import { getUploadEndpoint, API_CONFIG } from '../../../config/api'

interface UploadedFile {
  file_type: 'document' | 'excel'
  filename: string
  doc_id: string
  page_count?: number
  row_count?: number
  column_count?: number
  columns?: string[]
}

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'upload-success'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const chatStore = useChatStore()

// State
const selectedFiles = ref<File[]>([])
const uploadedFiles = ref<UploadedFile[]>([])
const isDragging = ref(false)
const isUploading = ref(false)
const isDeletingFile = ref<string | null>(null)
const deleteConfirmId = ref<string | null>(null)
const errorMessage = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

// Get or generate session ID
const getSessionId = (): string => {
  // Use current thread ID if available, otherwise generate a new one
  if (chatStore.currentThreadId) {
    return chatStore.currentThreadId
  }
  // Generate a simple session ID
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// File handling
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

const addFiles = (files: File[]) => {
  errorMessage.value = ''
  const validExtensions = ['.pdf', '.docx', '.xlsx', '.xls']
  const validFiles = files.filter(file => {
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    return validExtensions.includes(ext)
  })
  
  if (validFiles.length !== files.length) {
    errorMessage.value = 'Some files were skipped. Only PDF, DOCX, XLSX, and XLS files are supported.'
  }
  
  selectedFiles.value.push(...validFiles)
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  errorMessage.value = ''
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Upload handling
const handleUpload = async () => {
  if (selectedFiles.value.length === 0 || !chatStore.userId) {
    errorMessage.value = 'No files selected or user ID not set'
    return
  }

  isUploading.value = true
  errorMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('user_id', chatStore.userId)
    
    // Add session_id for Excel files
    const sessionId = getSessionId()
    formData.append('session_id', sessionId)
    
    // Add all selected files
    selectedFiles.value.forEach(file => {
      formData.append('files', file)
    })

    // Use direct endpoint for uploads to bypass Vercel proxy
    const uploadUrl = getUploadEndpoint()
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'X-API-Key': API_CONFIG.API_KEY
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Upload failed: ${response.status}`)
    }

    const result = await response.json()
    
    // Add successfully uploaded files to the list
    if (result.results) {
      uploadedFiles.value.push(...result.results.filter((r: any) => r.doc_id))
    }

    // Clear selected files after successful upload
    selectedFiles.value = []
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }

    emit('upload-success')
    
    // Show success message
    if (result.errors && result.errors.length > 0) {
      errorMessage.value = `${result.successful} file(s) uploaded successfully. ${result.failed} failed.`
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    errorMessage.value = error.message || 'Failed to upload files'
  } finally {
    isUploading.value = false
  }
}

// Delete handling
const showDeleteConfirm = (docId: string) => {
  deleteConfirmId.value = docId
}

const cancelDeleteFile = () => {
  deleteConfirmId.value = null
}

const confirmDeleteFile = async (docId: string) => {
  if (!chatStore.userId) return

  deleteConfirmId.value = null
  isDeletingFile.value = docId
  errorMessage.value = ''

  try {
    await documentAPI.deleteDocument(chatStore.userId, docId)
    
    // Remove from uploaded files list
    uploadedFiles.value = uploadedFiles.value.filter(f => f.doc_id !== docId)
  } catch (error: any) {
    console.error('Delete error:', error)
    errorMessage.value = error.message || 'Failed to delete file'
  } finally {
    isDeletingFile.value = null
  }
}

// Modal handling
const handleClose = () => {
  // Clear files when chat is started (if there are messages)
  if (chatStore.hasUserMessages) {
    selectedFiles.value = []
    uploadedFiles.value = []
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
  emit('close')
}
</script>
