<template>
  <div class="min-h-screen bg-gray-50">


    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">


      <!-- Filters and Search -->
      <DocumentFilters />

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
      <div v-if="isLoading && documents.length === 0" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Loading documents...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!isLoading && documents.length === 0" class="text-center py-12">
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
      <DocumentGrid v-else :documents="filteredDocuments" />

      <!-- Document Detail Modal -->
      <DocumentDetailModal 
        v-if="selectedDocument" 
        :document="selectedDocument"
        @close="clearSelectedDocument"
        key="document-modal"
      />
      

    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDocumentStore } from '../stores/document'
import { 
  MessageCircle, 
  FileText, 
  AlertCircle 
} from 'lucide-vue-next'
import DocumentFilters from '../components/features/dashboard/DocumentFilters.vue'
import DocumentGrid from '../components/features/dashboard/DocumentGrid.vue'
import DocumentDetailModal from '../components/features/dashboard/DocumentDetailModal.vue'

const documentStore = useDocumentStore()

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
  fetchDocuments()
}

// Watch for selectedDocument changes
watch(selectedDocument, (newDoc, oldDoc) => {
  console.log('selectedDocument changed from:', oldDoc, 'to:', newDoc)
  if (newDoc) {
    console.log('Modal should open with document:', newDoc.metadata.doc_name)
  } else {
    console.log('Modal should close')
  }
})

// Initialize
onMounted(async () => {
  console.log('Dashboard mounted, fetching documents...')
  await fetchDocuments()
  console.log('Documents in component after fetch:', documents.value)
  console.log('Filtered documents:', filteredDocuments.value)
})
</script>
