export interface Document {
  doc_id: string
  file_type: 'document' | 'excel'
  filename: string
  created_at: string
  content_preview: string | null
  page_count: number | null
  // Computed/mapped fields for backward compatibility
  user_id?: string
  doc_name?: string // mapped from filename
  summary?: string // mapped from content_preview
  tags?: string[] // empty array by default
  created_by?: 'assistant' | 'upload' // inferred from file_type or null
  page_range?: string // formatted from page_count
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
  items: Document[]
  total_count: number
  document_count: number
  excel_count: number
}

export interface DocumentFilters {
  search: string
  createdBy: 'assistant' | 'upload' | 'all'
  tags: string[]
  sortBy: 'created_at' | 'doc_name'
  sortOrder: 'asc' | 'desc'
}
