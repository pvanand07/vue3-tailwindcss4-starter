<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-4xl h-[90vh] w-full overflow-hidden flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <BookOpen class="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 v-if="content" class="text-lg font-semibold text-gray-900">{{ content.section_info.title }}</h2>
            <h2 v-else class="text-lg font-semibold text-gray-900">Reference Details</h2>
            <p v-if="reference" class="text-xs text-gray-500">
              {{ reference.building_code }} - {{ reference.id_block }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="content"
            @click="copyContent"
            class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Copy Content"
          >
            <Copy class="w-4 h-4" />
          </button>
          <button
            @click="closeModal"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
            title="Close"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex-1 flex items-center justify-center p-6">
        <div class="flex items-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Loading reference content...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex-1 flex items-center justify-center p-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <div class="flex items-center">
            <AlertCircle class="w-5 h-5 text-red-500 mr-2" />
            <h3 class="text-sm font-medium text-red-800">Error Loading Reference</h3>
          </div>
          <p class="mt-2 text-sm text-red-700">{{ error }}</p>
          <button
            @click="retryFetch"
            class="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>

      <!-- Content -->
      <div v-else-if="content" class="flex-1 flex flex-col min-h-0">
        <!-- Content Pages -->
        <div class="flex-1 overflow-y-auto min-h-0">
          <div v-if="content.pages.length > 0" class="space-y-0">
            <!-- Summary at the top -->
            <div class="bg-blue-50 border-b border-blue-200 px-6 py-4">
              <h4 class="font-medium text-blue-900 mb-2">Summary</h4>
              <p class="text-sm text-blue-800 leading-relaxed">
                {{ content.section_info.content_summary }}
              </p>
            </div>
            
            <!-- Pages -->
            <div v-for="page in content.pages" :key="page.index" class="border-b border-gray-200 last:border-b-0">
              <div class="bg-gray-100 px-6 py-3 border-b border-gray-200">
                <h4 class="font-medium text-gray-900">Page {{ page.index }}</h4>
              </div>
              <div class="px-6 py-4">
                <div class="prose prose-sm max-w-none">
                  <MarkdownRenderer :content="page.markdown" />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-full text-gray-500">
            No content pages available for this reference.
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, BookOpen, AlertCircle, Copy } from 'lucide-vue-next'
import type { Reference, ReferenceContent } from '../../../types/chat'
import { chatAPI } from '../../../api/chat'
import MarkdownRenderer from './MarkdownRenderer.vue'

interface Props {
  isOpen: boolean
  reference: Reference | null
}

interface Emits {
  (e: 'close'): void
  (e: 'copy-content', content: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isLoading = ref(false)
const error = ref<string | null>(null)
const content = ref<ReferenceContent | null>(null)

const closeModal = () => {
  emit('close')
}

const fetchContent = async () => {
  if (!props.reference) return

  isLoading.value = true
  error.value = null
  content.value = null

  try {
    const referenceContent = await chatAPI.fetchReferenceContent(props.reference)
    content.value = referenceContent
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load reference content'
    console.error('Error fetching reference content:', err)
  } finally {
    isLoading.value = false
  }
}

const retryFetch = () => {
  fetchContent()
}

const copyContent = async () => {
  if (!content.value) return
  
  let contentToCopy = `# ${content.value.section_info.title}\n\n`
  contentToCopy += `**Document:** ${content.value.document_id}\n`
  contentToCopy += `**Section:** ${content.value.section_info.id}\n`
  contentToCopy += `**Pages:** ${content.value.section_info.page_range}\n\n`
  contentToCopy += `**Summary:** ${content.value.section_info.content_summary}\n\n`
  
  if (content.value.pages.length > 0) {
    contentToCopy += '## Content\n\n'
    content.value.pages.forEach(page => {
      contentToCopy += `### Page ${page.index}\n\n${page.markdown}\n\n`
    })
  }
  
  try {
    await navigator.clipboard.writeText(contentToCopy)
    emit('copy-content', 'Reference content copied to clipboard')
  } catch (err) {
    console.error('Failed to copy content:', err)
  }
}

// Watch for reference changes and fetch content
watch(() => props.reference, (newReference) => {
  if (newReference && props.isOpen) {
    fetchContent()
  }
}, { immediate: true })

// Watch for modal open state
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.reference && !content.value && !isLoading.value) {
    fetchContent()
  }
})
</script>
