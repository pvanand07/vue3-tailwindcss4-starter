<template>
  <div class="bg-white shadow-sm rounded-lg p-4 mb-4 max-w-4xl">
    <div class="grid grid-cols-1 gap-3 lg:grid-cols-4">
      <!-- Search Input -->
      <div class="lg:col-span-2">
        <label for="search" class="block text-sm font-medium text-[#0F172A] mb-1">
          Search Documents
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="h-4 w-4 text-[#94A3B8]" />
          </div>
          <input
            id="search"
            v-model="localFilters.search"
            type="text"
            placeholder="Search by name, summary, or tags..."
            class="block w-full pl-10 pr-3 py-2 border border-[#E5E7EB] rounded-md leading-5 bg-white placeholder-[#94A3B8] focus:outline-none focus:placeholder-[#64748B] focus:ring-1 focus:ring-[#2F5BFF] focus:border-[#2F5BFF]"
            @input="updateFilters"
          />
        </div>
      </div>

      <!-- Created By Filter -->
      <div>
        <label for="createdBy" class="block text-sm font-medium text-[#0F172A] mb-1">
          Source
        </label>
        <select
          id="createdBy"
          v-model="localFilters.createdBy"
          class="block w-full px-3 py-2 border border-[#E5E7EB] rounded-md shadow-sm focus:outline-none focus:ring-[#2F5BFF] focus:border-[#2F5BFF]"
          @change="updateFilters"
        >
          <option value="all">All Sources</option>
          <option value="assistant">AI Generated</option>
        </select>
      </div>

      <!-- Sort Options -->
      <div>
        <label for="sortBy" class="block text-sm font-medium text-[#0F172A] mb-1">
          Sort By
        </label>
        <div class="flex space-x-2">
          <select
            id="sortBy"
            v-model="localFilters.sortBy"
            class="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-md shadow-sm focus:outline-none focus:ring-[#2F5BFF] focus:border-[#2F5BFF]"
            @change="updateFilters"
          >
            <option value="created_at">Date Created</option>
            <option value="doc_name">Name</option>
          </select>
          <button
            @click="toggleSortOrder"
            class="px-3 py-2 border border-[#E5E7EB] rounded-md hover:bg-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#2F5BFF]"
            :title="localFilters.sortOrder === 'desc' ? 'Sort Ascending' : 'Sort Descending'"
          >
            <ArrowUpDown class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Active Filters Summary -->
    <div v-if="hasActiveFilters" class="mt-3 pt-3 border-t border-[#E5E7EB]">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-[#475569]">Active filters:</span>
          <div class="flex items-center space-x-2">
            <span v-if="localFilters.search" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#E4E9FF] text-[#2F5BFF]">
              Search: "{{ localFilters.search }}"
            </span>
            <span v-if="localFilters.createdBy !== 'all'" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
              Source: AI Generated
            </span>
          </div>
        </div>
        <button
          @click="clearAllFilters"
          class="text-sm text-[#475569] hover:text-[#0F172A] underline"
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
import { Search, ArrowUpDown } from 'lucide-vue-next'
import { useDocumentStore } from '../../../stores/document'
import type { DocumentFilters } from '../../../types/document'

const documentStore = useDocumentStore()

// Get available tags and current filters (maintain reactivity)
const { filters: currentFilters } = storeToRefs(documentStore)

// Local reactive filters for immediate UI updates
const localFilters = reactive<DocumentFilters>({ ...currentFilters.value })

// Watch for external changes to filters (e.g., from other components)
watch(currentFilters, (newFilters) => {
  Object.assign(localFilters, newFilters)
}, { deep: true })

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return localFilters.search || localFilters.createdBy !== 'all'
})

// Methods
const updateFilters = () => {
  documentStore.updateFilters(localFilters)
}

const toggleSortOrder = () => {
  localFilters.sortOrder = localFilters.sortOrder === 'desc' ? 'asc' : 'desc'
  updateFilters()
}

const clearAllFilters = () => {
  documentStore.clearFilters()
}
</script>
