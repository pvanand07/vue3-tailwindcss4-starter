<template>
  <div 
    class="bg-white overflow-hidden shadow-sm border rounded-lg hover:shadow-md transition-shadow cursor-pointer max-w-sm"
    @click="$emit('click', document)"
  >
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-medium text-gray-900 line-clamp-2" :title="document.doc_name">
            {{ document.doc_name }}
          </h3>
          <div class="mt-1 flex items-center space-x-2">
            <span class="text-xs text-gray-500">
              {{ getPageDisplay(document.page_range) }}
            </span>
          </div>
        </div>
        <button
          @click.stop="$emit('favorite', document)"
          class="ml-2 text-gray-400 hover:text-yellow-500 transition-colors"
        >
          <Star class="w-5 h-5" />
        </button>
      </div>

      <!-- Summary -->
      <div class="mt-4">
        <p 
          v-if="document.summary" 
          class="text-sm text-gray-600 line-clamp-4"
          :title="document.summary"
        >
          {{ document.summary }}
        </p>
        <p v-else class="text-sm text-gray-400 italic">
          No summary available
        </p>
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-4 border-t border-gray-200">
        <div class="flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center">
            <Calendar class="w-4 h-4 mr-1" />
            {{ formatDate(document.created_at) }}
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click.stop="$emit('share', document)"
              class="text-gray-400 hover:text-blue-500 transition-colors"
              title="Share document"
            >
              <Share2 class="w-4 h-4" />
            </button>
            <button
              @click.stop="$emit('download', document)"
              class="text-gray-400 hover:text-green-500 transition-colors"
              title="Download document"
            >
              <Download class="w-4 h-4" />
            </button>
            <button
              @click.stop="$emit('delete', document)"
              class="text-gray-400 hover:text-red-500 transition-colors"
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

defineProps<{
  document: Document
}>()

defineEmits<{
  click: [document: Document]
  favorite: [document: Document]
  share: [document: Document]
  download: [document: Document]
  delete: [document: Document]
}>()

// Function to format page display
const getPageDisplay = (pageRange: string) => {
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
