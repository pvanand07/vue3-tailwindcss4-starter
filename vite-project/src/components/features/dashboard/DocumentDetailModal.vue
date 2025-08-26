<template>
  <div class="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-[9998]" 
        aria-hidden="true"
        @click="$emit('close')"
      ></div>

      <!-- Modal panel -->
      <div 
        :class="[
          'inline-block align-middle bg-white text-left overflow-hidden shadow-xl transform transition-all z-[9999] relative',
          isFullscreen 
            ? 'fixed inset-2 w-auto h-auto max-w-none max-h-none rounded-none' 
            : 'rounded-lg my-2 md:my-4 max-w-6xl w-full mx-2 md:mx-4 max-h-[98vh]'
        ]"
      >
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 p-6 pb-4">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-semibold text-gray-900" id="modal-title">
                {{ document.metadata.doc_name }}
              </h3>
              <div class="mt-2 flex items-center space-x-4">
                <span 
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                    document.metadata.created_by === 'assistant' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  ]"
                >
                  <component 
                    :is="document.metadata.created_by === 'assistant' ? Bot : Upload" 
                    class="w-4 h-4 mr-1" 
                  />
                  {{ document.metadata.created_by === 'assistant' ? 'AI Generated' : 'Uploaded' }}
                </span>
                <span class="text-sm text-gray-500">
                  {{ document.metadata.page_range }} page{{ document.metadata.page_range.includes('-') ? 's' : '' }}
                </span>
                <span class="text-sm text-gray-500">
                  Created {{ formatDate(document.metadata.created_at) }}
                </span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="toggleFullscreen"
                class="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                :title="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
              >
                <span class="sr-only">{{ isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen' }}</span>
                <component :is="isFullscreen ? Minimize2 : Maximize2" class="h-5 w-5" />
              </button>
              <button
                @click="$emit('close')"
                class="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span class="sr-only">Close</span>
                <X class="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div 
          :class="[
            'bg-gray-50 px-2 md:px-6 py-3 md:py-5 overflow-y-auto',
            isFullscreen ? 'max-h-[calc(100vh-8rem)]' : 'max-h-[85vh]'
          ]"
        >
          <div 
            :class="[
              'grid gap-3 md:gap-6',
              isFullscreen ? 'grid-cols-1 xl:grid-cols-5' : 'grid-cols-1 lg:grid-cols-4'
            ]"
          >
            <!-- Metadata Sidebar -->
            <div 
              :class="[
                isFullscreen ? 'xl:col-span-1' : 'lg:col-span-1'
              ]"
            >
              <div class="bg-white rounded-lg shadow-sm p-3 md:p-6">
                <h4 class="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4">Document Info</h4>
                
                <!-- Summary -->
                <div v-if="document.metadata.summary" class="mb-4">
                  <h5 class="text-sm font-medium text-gray-700 mb-2">Summary</h5>
                  <p class="text-sm text-gray-600">{{ document.metadata.summary }}</p>
                </div>

                <!-- Applicability -->
                <div v-if="document.metadata.applicability" class="mb-4">
                  <h5 class="text-sm font-medium text-gray-700 mb-2">Use Case</h5>
                  <p class="text-sm text-gray-600">{{ document.metadata.applicability }}</p>
                </div>

                <!-- Tags -->
                <div v-if="document.metadata.tags.length > 0" class="mb-4">
                  <h5 class="text-sm font-medium text-gray-700 mb-2">Tags</h5>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="tag in document.metadata.tags"
                      :key="tag"
                      class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      <Hash class="w-3 h-3 mr-1" />
                      {{ tag }}
                    </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="pt-4 border-t border-gray-200">
                  <div class="flex flex-col space-y-2">
                    <button
                      @click="downloadDocument"
                      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download class="w-4 h-4 mr-2" />
                      Download
                    </button>
                    <button
                      @click="shareDocument"
                      class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Share2 class="w-4 h-4 mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Document Content -->
            <div 
              :class="[
                isFullscreen ? 'xl:col-span-4' : 'lg:col-span-3'
              ]"
            >
              <div class="bg-white rounded-lg shadow-sm">
                <!-- Page Navigation -->
                <div v-if="pageNumbers.length > 1" class="border-b border-gray-200 px-6 py-3">
                  <div class="flex items-center justify-between">
                    <h4 class="text-lg font-medium text-gray-900">Content</h4>
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-gray-500">Page:</span>
                      <select
                        v-model="currentPage"
                        class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option
                          v-for="pageNum in pageNumbers"
                          :key="pageNum"
                          :value="pageNum"
                        >
                          {{ pageNum }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Page Content -->
                <div 
                  :class="[
                    'p-4 md:p-6 overflow-y-auto',
                    isFullscreen 
                      ? 'max-h-[calc(100vh-12rem)]' 
                      : 'max-h-[60vh] md:max-h-[70vh]'
                  ]"
                >
                  <div 
                    v-if="currentPageContent"
                    class="prose prose-sm lg:prose-base max-w-none leading-relaxed"
                    v-html="renderedContent"
                  ></div>
                  <div v-else class="text-gray-500 italic">
                    No content available for this page.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { X, Bot, Upload, Hash, Download, Share2, Maximize2, Minimize2 } from 'lucide-vue-next'
import type { DocumentDetail } from '../../../types/document'
import { formatDate } from '../../../utils/date'
import MarkdownIt from 'markdown-it'

const props = defineProps<{
  document: DocumentDetail
}>()

defineEmits<{
  close: []
}>()

// Debug logging
console.log('DocumentDetailModal mounted with document:', props.document)

// Initialize markdown parser
const md = new MarkdownIt()

// Current page state
const currentPage = ref('1')

// Fullscreen state
const isFullscreen = ref(false)

// Computed properties
const pageNumbers = computed(() => {
  return Object.keys(props.document.pages).sort((a, b) => parseInt(a) - parseInt(b))
})

const currentPageContent = computed(() => {
  return props.document.pages[currentPage.value] || ''
})

const renderedContent = computed(() => {
  if (!currentPageContent.value) return ''
  return md.render(currentPageContent.value)
})

// Initialize current page
if (pageNumbers.value.length > 0) {
  currentPage.value = pageNumbers.value[0]
}

// Methods
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const downloadDocument = () => {
  // Create a combined markdown content for download
  let fullContent = `# ${props.document.metadata.doc_name}\n\n`
  
  if (props.document.metadata.summary) {
    fullContent += `## Summary\n${props.document.metadata.summary}\n\n`
  }
  
  if (props.document.metadata.applicability) {
    fullContent += `## Use Case\n${props.document.metadata.applicability}\n\n`
  }
  
  if (props.document.metadata.tags.length > 0) {
    fullContent += `## Tags\n${props.document.metadata.tags.join(', ')}\n\n`
  }
  
  fullContent += `## Content\n\n`
  
  pageNumbers.value.forEach((pageNum) => {
    if (pageNumbers.value.length > 1) {
      fullContent += `### Page ${pageNum}\n\n`
    }
    fullContent += props.document.pages[pageNum] + '\n\n'
  })
  
  // Create and trigger download
  const blob = new Blob([fullContent], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.document.metadata.doc_name}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const shareDocument = () => {
  // Copy document URL or content to clipboard
  const shareText = `${props.document.metadata.doc_name}\n\n${props.document.metadata.summary || 'No summary available'}`
  
  if (navigator.share) {
    navigator.share({
      title: props.document.metadata.doc_name,
      text: shareText
    }).catch(console.error)
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText).then(() => {
      // You could show a toast notification here
      console.log('Document details copied to clipboard')
    }).catch(console.error)
  }
}
</script>

<style>
.prose {
  color: #374151;
  font-size: 1rem;
  line-height: 1.75;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  color: #111827;
  font-weight: 600;
  line-height: 1.25;
}

.prose h1 {
  font-size: 1.875rem;
  margin-bottom: 1.5rem;
  margin-top: 0;
}

.prose h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  margin-top: 2rem;
}

.prose h3 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  margin-top: 1.5rem;
}

.prose h4 {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  margin-top: 1.25rem;
}

.prose p {
  margin-bottom: 1.25rem;
  line-height: 1.75;
}

.prose ul,
.prose ol {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.prose pre {
  background-color: #f9fafb;
  padding: 1.25rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  line-height: 1.6;
}

.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1.5rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #6b7280;
  background-color: #f9fafb;
  padding: 1rem 0 1rem 1.5rem;
  border-radius: 0 0.375rem 0.375rem 0;
}

.prose strong {
  color: #111827;
  font-weight: 600;
}

.prose em {
  font-style: italic;
  color: #4b5563;
}

.prose hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 2rem 0;
}

.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.prose th,
.prose td {
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  text-align: left;
}

.prose th {
  background-color: #f9fafb;
  font-weight: 600;
}
</style>
