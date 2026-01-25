<template>
  <div 
    class="bg-white overflow-hidden shadow-sm border rounded-lg hover:shadow-md transition-shadow cursor-pointer max-w-sm"
    @click="$emit('click', document)"
  >
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-medium text-[#0F172A] line-clamp-2" :title="document.doc_name || document.filename">
            {{ document.doc_name || document.filename }}
          </h3>
          <div class="mt-1 flex items-center space-x-2">
            <span v-if="document.page_range || document.page_count !== null" class="text-xs text-[#475569]">
              {{ getPageDisplay(document.page_range || (document.page_count ? `1-${document.page_count}` : '')) }}
            </span>
            <span v-else class="text-xs text-[#94A3B8] italic">
              No page info
            </span>
          </div>
        </div>
        <button
          @click.stop="$emit('favorite', document)"
          class="ml-2 text-[#94A3B8] hover:text-yellow-500 transition-colors"
        >
          <Star class="w-5 h-5" />
        </button>
      </div>

      <!-- Summary -->
      <div class="mt-4">
        <p 
          v-if="document.summary || document.content_preview" 
          class="text-sm text-[#475569] line-clamp-4"
          :title="document.summary || document.content_preview || ''"
        >
          {{ document.summary || document.content_preview }}
        </p>
        <p v-else class="text-sm text-[#94A3B8] italic">
          No summary available
        </p>
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-4 border-t border-[#E5E7EB] overflow-visible">
        <div class="flex items-center justify-between text-xs text-[#475569]">
          <div class="flex items-center">
            <Calendar class="w-4 h-4 mr-1" />
            {{ formatDate(document.created_at) }}
          </div>
          <div class="flex items-center space-x-2 relative z-10">
            <button
              v-if="!showDeleteConfirm"
              @click.stop="$emit('share', document)"
              class="text-[#64748B] hover:text-[#2F5BFF] transition-colors"
              title="Share document"
            >
              <Share2 class="w-4 h-4" />
            </button>
            <button
              v-if="!showDeleteConfirm"
              @click.stop="$emit('download', document)"
              class="text-[#64748B] hover:text-[#22C55E] transition-colors"
              title="Download document"
            >
              <Download class="w-4 h-4" />
            </button>
            <!-- Delete Confirmation -->
            <div v-if="showDeleteConfirm" class="flex items-center space-x-1 bg-red-50 border border-red-200 rounded-md px-2 py-1 z-10 relative">
              <span class="text-xs text-red-700 font-medium">Delete?</span>
              <button
                @click.stop="confirmDelete"
                class="text-[#EF4444] hover:text-red-700 hover:bg-red-100 rounded px-1.5 py-0.5 text-xs font-medium transition-colors"
                title="Confirm delete"
              >
                Yes
              </button>
              <button
                @click.stop="cancelDelete"
                class="text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded px-1.5 py-0.5 text-xs font-medium transition-colors"
                title="Cancel"
              >
                Cancel
              </button>
            </div>
            <button
              v-else
              @click.stop="showDeleteConfirm = true"
              class="text-[#64748B] hover:text-[#EF4444] transition-colors"
              title="Delete document"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { defineProps, defineEmits } from 'vue'
import { 
  Calendar, 
  Star, 
  Share2, 
  Download, 
  Trash2 
} from 'lucide-vue-next'
import type { Document } from '../../../types/document'
import { formatDate } from '../../../utils/date'

const props = defineProps<{
  document: Document
}>()

type Emits = {
  click: [document: Document]
  favorite: [document: Document]
  share: [document: Document]
  download: [document: Document]
  delete: [document: Document]
}

const emit = defineEmits<Emits>()

const showDeleteConfirm = ref(false)

const confirmDelete = () => {
  emit('delete', props.document)
  showDeleteConfirm.value = false
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

// Function to format page display
const getPageDisplay = (pageRange: string | undefined) => {
  if (!pageRange) return ''
  if (pageRange.includes('-')) {
    const [start, end] = pageRange.split('-').map(Number)
    if (start === end) {
      return `${start} page`
    }
    return `${end - start + 1} pages`
  }
  return `${pageRange} page`
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
