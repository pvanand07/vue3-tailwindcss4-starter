import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';

// --- TYPE DEFINITIONS (from src/types/chat.ts and src/api/chat.ts) ---

interface ChatTool {
  name: string;
  input: string;
  reasoning?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tools?: ChatTool[];
  charts?: string[];
  thinkingExpanded?: boolean;
  isLoading?: boolean;
  timestamp?: string;
}

interface ChatStreamEvent {
  type: 'tool_start' | 'chunk' | 'tool_end' | 'progress' | 'full_response';
  name?: string;
  tool?: string;
  input?: any;
  reasoning?: string;
  content?: string;
  output?: string;
  data?: string;
  artifacts_data?: {
    chart_svg?: string;
  };
}

// --- API CONFIGURATION ---

const API_CONFIG = {
  ENDPOINT: '/api/v1/chat', // Using Vite proxy
};

// --- SUB-COMPONENTS ---

// Chart Renderer Component (equivalent to ChartRenderer.vue)
const ChartRenderer: React.FC<{ chartSvg?: string }> = ({ chartSvg }) => {
  if (!chartSvg) return null;
  return (
    <div className="chart-container my-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="chart-wrapper" dangerouslySetInnerHTML={{ __html: chartSvg }} />
    </div>
  );
};

// Markdown Renderer Component (equivalent to MarkdownRenderer.vue)
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Using react-markdown library. You might need to add plugins for full compatibility.
  return <ReactMarkdown className="markdown-content text-sm md:text-base leading-relaxed">{content}</ReactMarkdown>;
};

// Chat Message Component (equivalent to ChatMessage.vue)
const ChatMessageComponent: React.FC<{ message: ChatMessage; onToggleThinking: (id: string) => void }> = ({ message, onToggleThinking }) => {
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(message.thinkingExpanded ?? false);

  const handleToggleThinking = () => {
    setIsThinkingExpanded(!isThinkingExpanded);
    onToggleThinking(message.id);
  }

  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-2xl">
          <div className="bg-primary text-white p-4 rounded-xl rounded-br-none">
            <p className="text-sm md:text-base leading-relaxed">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  if (message.role === 'assistant') {
    return (
      <div className="flex gap-3 mb-6">
        <div className="flex-1 max-w-full">
          {/* Thinking Section */}
          {message.tools && message.tools.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg mb-4 overflow-hidden">
              <div
                className="bg-slate-100 p-3 cursor-pointer flex items-center justify-between font-medium text-slate-600 hover:bg-slate-200 transition-colors duration-200 select-none"
                onClick={handleToggleThinking}
                role="button"
                aria-expanded={isThinkingExpanded}
              >
                <span>🤔 Thinking...</span>
                <span className={`text-xs transition-transform duration-200 ${isThinkingExpanded ? 'rotate-180' : ''}`}>▼</span>
              </div>
              {isThinkingExpanded && (
                <div className="p-4">
                  <div className="max-h-96 overflow-y-auto scrollbar-thin">
                    {message.tools.map((tool, index) => (
                      <div key={index} className="mb-3 p-3 bg-white rounded-md border-l-4 border-primary">
                        <div className="font-semibold text-primary text-sm mb-2">🔧 {tool.name}</div>
                        <div className="bg-slate-50 p-2 rounded text-xs font-mono text-primary mb-2 break-all">{tool.input}</div>
                        {tool.reasoning && <div className="text-slate-600 italic text-xs leading-relaxed">💭 {tool.reasoning}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Charts Section */}
          {message.charts && message.charts.length > 0 && (
            <div className="mb-4">
              {message.charts.map((chartSvg, index) => (
                <ChartRenderer key={index} chartSvg={chartSvg} />
              ))}
            </div>
          )}

          {/* Bot Response Content */}
          <div className="text-slate-700 max-w-full w-full">
            <MarkdownRenderer content={message.content} />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// --- MAIN CHAT COMPONENT ---

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>(() => uuidv4());
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim()) return;

    setIsLoading(true);
    setInputMessage('');
    
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };
    
    const assistantMessageId = uuidv4();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      isLoading: true,
      tools: [],
      charts: [],
      thinkingExpanded: false,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(API_CONFIG.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: messageContent,
          conversation_id: conversationId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.body) throw new Error('No response body');
      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data:')) continue;

          try {
            const eventData: ChatStreamEvent = JSON.parse(line.substring(5).trim());
            
            setMessages(prev => prev.map(msg => {
                if (msg.id === assistantMessageId) {
                    const updatedMsg = { ...msg };
                    switch (eventData.type) {
                        case 'tool_start':
                            updatedMsg.tools = updatedMsg.tools || [];
                            updatedMsg.tools.push({
                                name: eventData.name || eventData.tool || 'Unknown Tool',
                                input: JSON.stringify(eventData.input || ''),
                                reasoning: eventData.reasoning || ''
                            });
                            updatedMsg.thinkingExpanded = true;
                            break;
                        case 'chunk':
                            updatedMsg.content += eventData.content || '';
                            break;
                        case 'tool_end':
                             if (eventData.artifacts_data?.chart_svg) {
                                updatedMsg.charts = updatedMsg.charts || [];
                                updatedMsg.charts.push(eventData.artifacts_data.chart_svg);
                            }
                            break;
                    }
                    return updatedMsg;
                }
                return msg;
            }));

          } catch (e) {
            console.error('Error parsing JSON:', e, line);
          }
        }
      }
    } catch (error) {
        if((error as Error).name !== 'AbortError') {
            console.error('Fetch error:', error);
            setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? {...msg, content: "Sorry, an error occurred."} : msg));
        }
    } finally {
      setIsLoading(false);
      setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, isLoading: false } : msg));
    }
  }, [conversationId]);

  const handleToggleThinking = (messageId: string) => {
      setMessages(prev => prev.map(msg => msg.id === messageId ? {...msg, thinkingExpanded: !msg.thinkingExpanded} : msg));
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <ChatMessageComponent key={msg.id} message={msg} onToggleThinking={handleToggleThinking} />
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
             <div className="flex gap-3 mb-6">
                 <div className="flex-1">
                     <div className="text-slate-700 flex items-center gap-2">
                         <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                     </div>
                 </div>
             </div>
          )}
        </div>
      </div>

      {/* Chat Input */}
      <footer className="p-4 w-full">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMessage); }}>
            <div className="relative bg-white border border-slate-200 rounded-xl shadow-lg p-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputMessage);
                  }
                }}
                disabled={isLoading}
                className="w-full bg-transparent p-2 text-slate-800 placeholder-slate-500 focus:outline-none resize-none"
                rows={1}
                placeholder="Ask a question..."
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-3 bottom-3 rounded-lg p-2 bg-primary text-white hover:bg-slate-700 disabled:bg-slate-300"
              >
                {/* Use an icon here like ArrowUp */}
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default ChatComponent;
