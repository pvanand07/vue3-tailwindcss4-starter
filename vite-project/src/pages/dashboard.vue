<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <ChatSidebar 
      :isOpen="isSidebarOpen" 
      @close="isSidebarOpen = false"
      @chat-loaded="handleChatLoaded"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col" :class="{ 'md:ml-80': isSidebarOpen }">
      <!-- Top Bar -->
      <div class="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div class="flex items-center space-x-4">
          <button
            @click="isSidebarOpen = !isSidebarOpen"
            class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu class="w-5 h-5" />
          </button>
          <h1 class="text-lg font-semibold text-gray-900">Documents</h1>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="showUploadModal = true"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            :disabled="!chatStore.userId"
          >
            <Upload class="w-4 h-4 mr-2" />
            Upload PDF
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <main class="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-4 relative">
        <!-- User ID Not Set Prompt -->
        <div v-if="!chatStore.userId" class="mb-6">
          <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <AlertCircle class="h-5 w-5 text-yellow-400" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">User ID Required</h3>
                <div class="mt-2 text-sm text-yellow-700">
                  <p>Please set your User ID to access your documents. You can set it in the sidebar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Search -->
        <DocumentFilters v-if="chatStore.userId" />

        <!-- Error State -->
        <div v-if="error" class="mb-6">
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <AlertCircle class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error loading documents</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ error }}</p>
                </div>
                <div class="mt-4">
                  <button
                    @click="retryFetch"
                    class="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="chatStore.userId && isLoading && documents.length === 0" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Loading documents...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="chatStore.userId && !isLoading && documents.length === 0" class="text-center py-12">
          <FileText class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating your first document in chat.</p>
          <div class="mt-6">
            <router-link
              to="/chat"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <MessageCircle class="w-4 h-4 mr-2" />
              Start Chatting
            </router-link>
          </div>
        </div>

        <!-- Documents Grid -->
        <DocumentGrid v-else-if="chatStore.userId" :documents="filteredDocuments" />

        <!-- Document Detail Modal -->
        <DocumentDetailModal 
          v-if="selectedDocument" 
          :document="selectedDocument"
          @close="clearSelectedDocument"
          key="document-modal"
        />

        <!-- Document Upload Modal -->
        <DocumentUploadModal 
          :is-visible="showUploadModal"
          @close="showUploadModal = false"
          @upload-success="handleUploadSuccess"
        />

        <!-- Floating Controls -->
        <FloatingControls 
          :sidebar-open="isSidebarOpen"
          :selected-model="chatStore.selectedModel"
          :create-mode="false"
          @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
          @start-new-chat="handleNewChatFromDocument"
          @update:selected-model="chatStore.setSelectedModel"
          @toggle-create-mode="() => {}"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDocumentStore } from '../stores/document'
import { useChatStore } from '../stores/chat'
import { 
  MessageCircle, 
  FileText, 
  AlertCircle,
  Menu,
  Upload
} from 'lucide-vue-next'
import ChatSidebar from '../components/layout/ChatSidebar.vue'

import FloatingControls from '../components/features/chat/FloatingControls.vue'
import DocumentFilters from '../components/features/dashboard/DocumentFilters.vue'
import DocumentGrid from '../components/features/dashboard/DocumentGrid.vue'
import DocumentDetailModal from '../components/features/dashboard/DocumentDetailModal.vue'
import DocumentUploadModal from '../components/features/dashboard/DocumentUploadModal.vue'

const documentStore = useDocumentStore()
const chatStore = useChatStore()
const router = useRouter()

// Local state
const isSidebarOpen = ref(false)
const showUploadModal = ref(false)

// Reactive properties (maintain reactivity)
const { 
  documents, 
  selectedDocument, 
  isLoading, 
  error, 
  filteredDocuments
} = storeToRefs(documentStore)

// Methods (don't need reactivity)
const { 
  fetchDocuments, 
  clearError, 
  clearSelectedDocument 
} = documentStore

// Retry fetch
const retryFetch = () => {
  clearError()
  if (chatStore.userId) {
    fetchDocuments(chatStore.userId)
  }
}



// Watch for selectedDocument changes
watch(selectedDocument, (newDoc) => {
  if (newDoc) {
    console.log('Modal opened for document:', newDoc.metadata.doc_name)
  }
})

// Methods for chat functionality

const handleChatLoaded = () => {
  // Navigate to chat when a chat is loaded from sidebar
  router.push('/chat')
}

const handleNewChatFromDocument = () => {
  // Start a new chat and navigate to chat page
  chatStore.startNewChat()
  router.push('/chat')
}

const handleUploadSuccess = (docId: string) => {
  console.log('Upload successful, document ID:', docId)
  // Refresh the documents list
  if (chatStore.userId) {
    fetchDocuments(chatStore.userId)
  }
}

// Watch for user ID changes
watch(() => chatStore.userId, (newUserId) => {
  if (newUserId) {
    fetchDocuments(newUserId)
  }
}, { immediate: true })

// Initialize
onMounted(async () => {
  // Initialize chat store to load user ID
  await chatStore.initialize()
  
  // Fetch documents if user ID is available
  if (chatStore.userId) {
    await fetchDocuments(chatStore.userId)
  }
  
  // Set sidebar open by default on larger screens, closed on mobile
  isSidebarOpen.value = window.innerWidth >= 768
  
  // Handle window resize to update sidebar state
  const handleResize = () => {
    if (window.innerWidth < 768) {
      isSidebarOpen.value = false
    }
  }
  
  window.addEventListener('resize', handleResize)
  
  // Cleanup on unmount
  const cleanup = () => {
    window.removeEventListener('resize', handleResize)
  }
  
  // Vue 3 way to handle cleanup
  return cleanup
})
</script>
