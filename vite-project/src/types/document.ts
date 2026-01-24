export interface Document {
  doc_id: string
  user_id: string
  doc_name: string
  summary: string
  tags: string[]
  created_at: string
  created_by: 'assistant'
  page_range: string
  filename?: string
  content_preview?: string
  file_type?: 'document' | 'excel'
  page_count?: number | null
}

export interface DocumentDetail {
  doc_id: string
  user_id: string
  metadata: {
    doc_name: string
    summary: string
    tags: string[]
    created_at: string
    created_by: 'assistant'
    page_range: string
    applicability?: string
  }
  content: string
  pages: Record<string, string>
}

export interface DocumentListResponse {
  documents?: Document[]
  items: Array<{
    doc_id: string
    filename: string
    content_preview?: string
    file_type: 'document' | 'excel'
    created_at: string
    page_count: number | null
  }>
  total_count: number
  document_count: number
  excel_count: number
}

export interface DocumentFilters {
  search: string
  createdBy: 'assistant' | 'all'
  tags: string[]
  sortBy: 'created_at' | 'doc_name'
  sortOrder: 'asc' | 'desc'
}
