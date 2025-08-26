import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { documentAPI } from '../api/document'
import type { Document, DocumentDetail, DocumentFilters } from '../types/document'

export const useDocumentStore = defineStore('document', () => {
  // State
  const documents = ref<Document[]>([])
  const selectedDocument = ref<DocumentDetail | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Filters
  const filters = ref<DocumentFilters>({
    search: '',
    createdBy: 'all',
    tags: [],
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  // Computed
  const filteredDocuments = computed(() => {
    return documentAPI.filterDocuments(documents.value, filters.value)
  })

  const availableTags = computed(() => {
    return documentAPI.getAllTags(documents.value)
  })

  const documentsByType = computed(() => {
    return {
      assistant: documents.value.filter(doc => doc.created_by === 'assistant'),
      upload: documents.value.filter(doc => doc.created_by === 'upload')
    }
  })

  const stats = computed(() => {
    return {
      total: documents.value.length,
      assistant: documentsByType.value.assistant.length,
      upload: documentsByType.value.upload.length,
      totalTags: availableTags.value.length
    }
  })

  // Actions
  async function fetchDocuments(userId: string) {
    if (!userId) {
      error.value = 'User ID is required to fetch documents'
      return
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const userDocuments = await documentAPI.getUserDocuments(userId)
      documents.value = userDocuments
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch documents'
      console.error('Error fetching documents:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDocumentDetail(userId: string, docId: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const detail = await documentAPI.getDocumentDetail(userId, docId)
      selectedDocument.value = detail
      return detail
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch document detail'
      console.error('Error fetching document detail:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function updateFilters(newFilters: Partial<DocumentFilters>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters() {
    filters.value = {
      search: '',
      createdBy: 'all',
      tags: [],
      sortBy: 'created_at',
      sortOrder: 'desc'
    }
  }

  function clearError() {
    error.value = null
  }

  function clearSelectedDocument() {
    selectedDocument.value = null
  }

  // Initialize
  function $reset() {
    documents.value = []
    selectedDocument.value = null
    isLoading.value = false
    error.value = null
    clearFilters()
  }

  return {
    // State
    documents,
    selectedDocument,
    isLoading,
    error,
    filters,
    
    // Computed
    filteredDocuments,
    availableTags,
    documentsByType,
    stats,
    
    // Actions
    fetchDocuments,
    fetchDocumentDetail,
    updateFilters,
    clearFilters,
    clearError,
    clearSelectedDocument,
    $reset
  }
})
