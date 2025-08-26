import type { Document, DocumentListResponse, DocumentDetail } from '../types/document'

// API Configuration
export const DOCUMENT_API_CONFIG = {
  BASE_URL: '/api/v1', // Using Vite proxy
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000
} as const

// Document API Class
export class DocumentAPI {
  private static instance: DocumentAPI
  
  static getInstance(): DocumentAPI {
    if (!DocumentAPI.instance) {
      DocumentAPI.instance = new DocumentAPI()
    }
    return DocumentAPI.instance
  }

  /**
   * Get all documents for a user
   */
  async getUserDocuments(userId: string): Promise<Document[]> {
    try {
      const response = await fetch(`${DOCUMENT_API_CONFIG.BASE_URL}/documents/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`)
      }

      const data: DocumentListResponse = await response.json()
      return data.documents
    } catch (error) {
      console.error('Error fetching user documents:', error)
      throw error
    }
  }

  /**
   * Get detailed document content
   */
  async getDocumentDetail(userId: string, docId: string): Promise<DocumentDetail> {
    try {
      const response = await fetch(`${DOCUMENT_API_CONFIG.BASE_URL}/user-document/${userId}/${docId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch document detail: ${response.status}`)
      }

      const data: DocumentDetail = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching document detail:', error)
      throw error
    }
  }

  /**
   * Filter and sort documents
   */
  filterDocuments(
    documents: Document[], 
    filters: {
      search?: string
      createdBy?: 'assistant' | 'upload' | 'all'
      tags?: string[]
      sortBy?: 'created_at' | 'doc_name'
      sortOrder?: 'asc' | 'desc'
    }
  ): Document[] {
    let filtered = [...documents]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(doc => 
        doc.doc_name.toLowerCase().includes(searchLower) ||
        doc.summary.toLowerCase().includes(searchLower) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply created_by filter
    if (filters.createdBy && filters.createdBy !== 'all') {
      filtered = filtered.filter(doc => doc.created_by === filters.createdBy)
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(doc => 
        filters.tags!.some(tag => doc.tags.includes(tag))
      )
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: string | Date
        let bValue: string | Date

        if (filters.sortBy === 'created_at') {
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
        } else {
          aValue = a[filters.sortBy!]
          bValue = b[filters.sortBy!]
        }

        let comparison = 0
        if (aValue > bValue) {
          comparison = 1
        } else if (aValue < bValue) {
          comparison = -1
        }

        return filters.sortOrder === 'desc' ? -comparison : comparison
      })
    }

    return filtered
  }

  /**
   * Get all unique tags from documents
   */
  getAllTags(documents: Document[]): string[] {
    const tagSet = new Set<string>()
    documents.forEach(doc => {
      doc.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }
}

// Export singleton instance
export const documentAPI = DocumentAPI.getInstance()
