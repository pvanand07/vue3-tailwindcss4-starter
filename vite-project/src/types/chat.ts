export interface ChatTool {
  name: string
  input: string
  reasoning?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tools?: ChatTool[]
  thinkingExpanded?: boolean
  isLoading?: boolean
  timestamp?: string
}

export interface Chat {
  _id: string
  title: string
  messages: ChatMessage[]
  conversationId: string
  createdAt: string
  updatedAt: string
}

export interface Reference {
  floats_block: string
  building_code: string
  start: number
  end: number
  original_text: string
}

export interface ReferenceContent {
  document_id: string
  section_id: string
  section_info: {
    title: string
    id: string
    page_range: string
    content_summary: string
    refers_to: string[]
    subsections: any[]
  }
  pages: Array<{
    index: number
    markdown: string
  }>
}

export interface ChatState {
  messages: ChatMessage[]
  chatHistory: Chat[]
  currentChatId: string | null
  currentChatTitle: string
  isLoading: boolean
  isTyping: boolean
  isThinking: boolean
  errorMessage: string
  selectedModel: string
  selectedState: string
  selectedCode: string
  selectedProjectType: string
  selectedSiteType: string
}