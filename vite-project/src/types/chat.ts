export interface ChatTool {
  name: string
  input: string
  reasoning?: string
}

export interface ToolEvent {
  type: 'tool_start' | 'tool_end'
  name: string
  input?: any
  output?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  thread_id?: string
  tools?: ChatTool[]
  tool_events?: ToolEvent[]
  thinkingExpanded?: boolean
  isLoading?: boolean
  timestamp?: string
  created_at?: string
}

export interface Thread {
  id: string
  user_id: string
  title?: string
  created_at: string
  updated_at: string
}

export interface ThreadListResponse {
  threads: Thread[]
  has_more: boolean
  after: string | null
}

export interface MessageResponse {
  id: string
  thread_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  tool_events?: ToolEvent[]
}

export interface ThreadMessagesResponse {
  messages: MessageResponse[]
  has_more: boolean
  after: string | null
}

export interface ChatState {
  messages: ChatMessage[]
  threads: Thread[]
  currentThreadId: string | null
  currentThreadTitle: string
  isLoading: boolean
  isTyping: boolean
  isThinking: boolean
  errorMessage: string
  selectedModel: string
}