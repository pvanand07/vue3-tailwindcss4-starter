<template>
  <div class="bg-white shadow-sm border rounded-lg p-6 mb-6">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <!-- Search Input -->
      <div class="lg:col-span-2">
        <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
          Search Documents
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="search"
            v-model="localFilters.search"
            type="text"
            placeholder="Search by name, summary, or tags..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            @input="updateFilters"
          />
        </div>
      </div>

      <!-- Created By Filter -->
      <div>
        <label for="createdBy" class="block text-sm font-medium text-gray-700 mb-2">
          Source
        </label>
        <select
          id="createdBy"
          v-model="localFilters.createdBy"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          @change="updateFilters"
        >
          <option value="all">All Sources</option>
          <option value="assistant">AI Generated</option>
          <option value="upload">Uploaded</option>
        </select>
      </div>

      <!-- Sort Options -->
      <div>
        <label for="sortBy" class="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <div class="flex space-x-2">
          <select
            id="sortBy"
            v-model="localFilters.sortBy"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            @change="updateFilters"
          >
            <option value="created_at">Date Created</option>
            <option value="doc_name">Name</option>
          </select>
          <button
            @click="toggleSortOrder"
            class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :title="localFilters.sortOrder === 'desc' ? 'Sort Ascending' : 'Sort Descending'"
          >
            <ArrowUpDown class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Tags Filter -->
    <div v-if="availableTags.length > 0" class="mt-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Filter by Tags
      </label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in availableTags"
          :key="tag"
          @click="toggleTag(tag)"
          :class="[
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors',
            localFilters.tags?.includes(tag)
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          ]"
        >
          <Hash class="w-3 h-3 mr-1" />
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Active Filters Summary -->
    <div v-if="hasActiveFilters" class="mt-4 pt-4 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">Active filters:</span>
          <div class="flex items-center space-x-2">
            <span v-if="localFilters.search" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{{ localFilters.search }}"
            </span>
            <span v-if="localFilters.createdBy !== 'all'" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
              Source: {{ localFilters.createdBy === 'assistant' ? 'AI Generated' : 'Uploaded' }}
            </span>
            <span v-if="localFilters.tags && localFilters.tags.length > 0" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
              Tags: {{ localFilters.tags.length }}
            </span>
          </div>
        </div>
        <button
          @click="clearAllFilters"
          class="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear all
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Search, ArrowUpDown, Hash } from 'lucide-vue-next'
import { useDocumentStore } from '../../../stores/document'
import type { DocumentFilters } from '../../../types/document'

const documentStore = useDocumentStore()

// Get available tags and current filters (maintain reactivity)
const { availableTags, filters: currentFilters } = storeToRefs(documentStore)

// Local reactive filters for immediate UI updates
const localFilters = reactive<DocumentFilters>({ ...currentFilters.value })

// Watch for external changes to filters (e.g., from other components)
watch(currentFilters, (newFilters) => {
  Object.assign(localFilters, newFilters)
}, { deep: true })

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return localFilters.search || 
         localFilters.createdBy !== 'all' || 
         (localFilters.tags && localFilters.tags.length > 0)
})

// Methods
const updateFilters = () => {
  documentStore.updateFilters(localFilters)
}

const toggleSortOrder = () => {
  localFilters.sortOrder = localFilters.sortOrder === 'desc' ? 'asc' : 'desc'
  updateFilters()
}

const toggleTag = (tag: string) => {
  if (!localFilters.tags) {
    localFilters.tags = []
  }
  
  const index = localFilters.tags.indexOf(tag)
  if (index > -1) {
    localFilters.tags.splice(index, 1)
  } else {
    localFilters.tags.push(tag)
  }
  
  updateFilters()
}

const clearAllFilters = () => {
  documentStore.clearFilters()
}
</script>
