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
  charts?: string[]
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
}