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
  const documentStats = ref<{
    total_count: number
    document_count: number
    excel_count: number
  } | null>(null)
  
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
      assistant: documents.value.filter(doc => doc.created_by === 'assistant')
    }
  })

  const stats = computed(() => {
    // Use API stats if available, otherwise compute from documents
    if (documentStats.value) {
      return {
        total: documentStats.value.total_count,
        document: documentStats.value.document_count,
        excel: documentStats.value.excel_count,
        assistant: documentsByType.value.assistant.length,
        totalTags: availableTags.value.length
      }
    }
    return {
      total: documents.value.length,
      document: documents.value.filter(doc => doc.file_type === 'document').length,
      excel: documents.value.filter(doc => doc.file_type === 'excel').length,
      assistant: documentsByType.value.assistant.length,
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
      // Fetch documents with stats
      const response = await documentAPI.getUserDocumentsWithStats(userId)
      
      // Map API response to Document format with backward compatibility fields
      documents.value = response.items.map(item => ({
        ...item,
        user_id: userId,
        doc_name: item.filename,
        summary: item.content_preview || '',
        tags: [],
        created_by: 'assistant',
        page_range: item.page_count !== null ? `1-${item.page_count}` : ''
      }))
      
      // Store stats
      documentStats.value = {
        total_count: response.total_count,
        document_count: response.document_count,
        excel_count: response.excel_count
      }
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

  async function deleteDocument(userId: string, docId: string) {
    if (!userId) {
      error.value = 'User ID is required to delete document'
      throw new Error('User ID is required')
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await documentAPI.deleteDocument(userId, docId)
      
      // Remove document from local state
      documents.value = documents.value.filter(doc => doc.doc_id !== docId)
      
      // If the deleted document was selected, clear selection
      if (selectedDocument.value?.doc_id === docId) {
        selectedDocument.value = null
      }

      // Update stats if available
      if (documentStats.value) {
        if (result.file_type === 'document') {
          documentStats.value.document_count = Math.max(0, documentStats.value.document_count - 1)
        } else if (result.file_type === 'excel') {
          documentStats.value.excel_count = Math.max(0, documentStats.value.excel_count - 1)
        }
        documentStats.value.total_count = Math.max(0, documentStats.value.total_count - 1)
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete document'
      console.error('Error deleting document:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Initialize
  function $reset() {
    documents.value = []
    selectedDocument.value = null
    isLoading.value = false
    error.value = null
    documentStats.value = null
    clearFilters()
  }

  return {
    // State
    documents,
    selectedDocument,
    isLoading,
    error,
    filters,
    documentStats,
    
    // Computed
    filteredDocuments,
    availableTags,
    documentsByType,
    stats,
    
    // Actions
    fetchDocuments,
    fetchDocumentDetail,
    deleteDocument,
    updateFilters,
    clearFilters,
    clearError,
    clearSelectedDocument,
    $reset
  }
})
