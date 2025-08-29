export interface Document {
  doc_id: string
  user_id: string
  doc_name: string
  summary: string
  tags: string[]
  created_at: string
  created_by: 'assistant' | 'upload'
  page_range: string
}

export interface DocumentDetail {
  doc_id: string
  user_id: string
  metadata: {
    doc_name: string
    summary: string
    tags: string[]
    created_at: string
    created_by: 'assistant' | 'upload'
    page_range: string
    applicability?: string
  }
  content: string
  pages: Record<string, string>
}

export interface DocumentListResponse {
  documents: Document[]
}

export interface DocumentFilters {
  search: string
  createdBy: 'assistant' | 'upload' | 'all'
  tags: string[]
  sortBy: 'created_at' | 'doc_name'
  sortOrder: 'asc' | 'desc'
}
