<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { PanelLeftOpen, SquarePen, ThumbsUp, ThumbsDown, Copy, Share2, Search, Lightbulb, ArrowUp, Square, Plus } from 'lucide-vue-next'
import { useChatStore } from './stores/chat'
import ChatSidebar from './components/layout/ChatSidebar.vue'

// Use Pinia store
const chatStore = useChatStore()

// Local UI state
const sidebarOpen = ref(true)
const inputMessage = ref('')

// Template refs
const chatMessages = ref<HTMLElement | null>(null)
const messageInput = ref<HTMLTextAreaElement | null>(null)

// Core functions
const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessages.value) {
      requestAnimationFrame(() => {
        chatMessages.value!.scrollTop = chatMessages.value!.scrollHeight
      })
    }
  })
}

// Chat management functions
const startNewChat = () => {
  chatStore.startNewChat()
  
  // Close sidebar on mobile
  if (window.innerWidth < 768) {
    sidebarOpen.value = false
  }
  
  scrollToBottom()
}

const onChatLoaded = () => {
  scrollToBottom()
}

const toggleThinking = (messageIndex: number) => {
  chatStore.toggleThinking(messageIndex)
}

// Message handling functions
const sendMessage = () => {
  if (!inputMessage.value.trim() || chatStore.isLoading) {
    return
  }
  
  chatStore.errorMessage = ''
  
  // Add user message
  chatStore.addMessage({
    role: 'user',
    content: inputMessage.value
  })

  const userMessage = inputMessage.value
  inputMessage.value = ''
  scrollToBottom()
  
  // Simulate bot response for UI testing
  chatStore.isLoading = true
  setTimeout(() => {
    chatStore.addMessage({
      role: 'assistant',
      content: 'This is a sample response for UI testing. The actual API integration will be added later.',
      isLoading: false
    })
    chatStore.isLoading = false
    scrollToBottom()
  }, 1000)
}

const handleEnterKey = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    return
  }
  event.preventDefault()
  sendMessage()
}

const copyMessage = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    console.log('File selected:', file)
  }
}

const generateThought = () => {
  chatStore.isThinking = true
  setTimeout(() => {
    inputMessage.value = "Let me think about this... What would be a good question to ask?"
    chatStore.isThinking = false
  }, 2000)
}

const generateQuickQuestion = () => {
  const question = chatStore.generateQuickQuestion()
  inputMessage.value = question
  
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.focus()
    }
    scrollToBottom()
  })
}

// Lifecycle
onMounted(() => {
  chatStore.initialize()
})
</script>

<template>
  <div id="app" class="flex h-screen">
    <!-- Chat Sidebar -->
    <ChatSidebar 
      :is-open="sidebarOpen" 
      @close="sidebarOpen = false"
      @chat-loaded="onChatLoaded"
    />

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col transition-all duration-300" :class="{ 'md:ml-80': sidebarOpen }">
      <!-- Floating Icons -->
      <div class="fixed top-2 left-2 z-50">
        <button 
          @click="sidebarOpen = !sidebarOpen"
          class="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-lg p-3 shadow-lg hover:bg-white/90 transition-colors"
          :aria-label="sidebarOpen ? 'Close sidebar' : 'Open sidebar'"
        >
          <PanelLeftOpen class="w-5 h-4 text-slate-700" />
        </button>
      </div>
      
      <div class="fixed top-2 right-2 z-50">
        <button 
          @click="startNewChat"
          class="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-lg p-3 shadow-lg hover:bg-white/90 transition-colors"
          aria-label="Start new chat"
        >
          <SquarePen class="w-5 h-4 text-slate-700" />
        </button>
      </div>

      <!-- Model Selector for Small Screens - Top Center -->
      <div class="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 sm:hidden">
        <select 
          v-model="chatStore.selectedModel" 
          class="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 shadow-lg hover:bg-white/90 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          aria-label="Select AI Model"
        >
          <option value="openai/gpt-4.1-mini">GPT-4.1 Mini</option>
          <option value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
          <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
          <option value="qwen/qwen3-coder:floor">Qwen3 Coder</option>
          <option value="">Grok 3 Mini</option>
        </select>
      </div>

      <!-- Chat Messages -->
      <main ref="chatMessages" class="flex-1 overflow-y-auto p-2 sm:p-4 md:p-8 scrollbar-thin pt-14">
        <div class="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6 transition-all duration-300" :class="{ 'md:max-w-6xl': !sidebarOpen }">
          <!-- Current Chat Title -->
          <div v-if="chatStore.currentChatTitle && chatStore.messages.length > 1" class="text-center mb-6">
            <h1 class="text-xl sm:text-2xl font-semibold text-slate-700">{{ chatStore.currentChatTitle }}</h1>
          </div>

          <!-- Empty State - Building Codes Interface -->
          <div v-if="!chatStore.hasUserMessages" class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
            <!-- Main Icon -->
            <div class="bg-slate-800 rounded-xl p-4 mb-6 shadow-lg">
              <div class="text-white text-2xl font-mono" role="img" aria-label="Code icon">&lt;/&gt;</div>
            </div>
            
            <!-- Main Heading -->
            <h1 class="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800 mb-3 px-4">
              Ask questions about building codes and regulations.
            </h1>
            
            <!-- Subtitle -->
            <p class="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 max-w-2xl px-4">
              Get instant answers about NBC 2016, IS codes, and regional building regulations.
            </p>
            
            <!-- Form Grid -->
            <div class="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
              <!-- State / Region -->
              <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <h3 class="font-medium text-slate-800 mb-2 text-sm">State / Region</h3>
                <select 
                  v-model="chatStore.selectedState" 
                  class="w-full p-2 text-sm border border-slate-300 rounded-md bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  aria-label="Select state or region"
                >
                  <option value="">Select location</option>
                  <option value="karnataka">Karnataka</option>
                  <option value="kerala">Kerala</option>
                </select>
              </div>
              
              <!-- Applicable Code -->
              <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <h3 class="font-medium text-slate-800 mb-2 text-sm">Applicable Code</h3>
                <select 
                  v-model="chatStore.selectedCode" 
                  class="w-full p-2 text-sm border border-slate-300 rounded-md bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  aria-label="Choose building codes"
                >
                  <option value="">Choose building codes</option>
                  <option value="kmbr">KMBR (Kerala Municipal Building Rules)</option>
                  <option value="kpbr">KPBR (Kerala Panchayat Building Rules)</option>
                  <option value="kmmbl">KMMBL (Karnataka Municipal Building Rules)</option>
                  <option value="crz">CRZ (Coastal Regulation Zone)</option>
                </select>
              </div>
              
              <!-- Project Type -->
              <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <h3 class="font-medium text-slate-800 mb-2 text-sm">Project Type</h3>
                <select 
                  v-model="chatStore.selectedProjectType" 
                  class="w-full p-2 text-sm border border-slate-300 rounded-md bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  aria-label="Select project category"
                >
                  <option value="">Select project category</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="hazardous">Hazardous</option>
                  <option value="assembly">Assembly</option>
                </select>
              </div>
              
              <!-- Site Type -->
              <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <h3 class="font-medium text-slate-800 mb-2 text-sm">Site Type</h3>
                <select 
                  v-model="chatStore.selectedSiteType" 
                  class="w-full p-2 text-sm border border-slate-300 rounded-md bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  aria-label="Specify site characteristics"
                >
                  <option value="">Specify site characteristics</option>
                  <option value="urban">Urban</option>
                  <option value="rural">Rural</option>
                  <option value="coastal">Coastal</option>
                  <option value="hilly">Hilly/Sloped</option>
                  <option value="industrial">Industrial</option>
                  <option value="green_belt">Green Belt</option>
                </select>
              </div>
            </div>
            
            <!-- Quick Start Button -->
            <button 
              @click="generateQuickQuestion"
              class="mt-6 bg-slate-600 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium text-sm"
              aria-label="Generate sample question based on selections"
            >
              <Search class="w-4 h-4" />
              Generate Sample Question
            </button>
          </div>

          <!-- Message Loop -->
          <div v-for="(message, index) in chatStore.messages" :key="message.id" class="w-full">
            <!-- AI Message -->
            <div v-if="message.role === 'assistant'" class="flex gap-3 mb-6">
              <div class="flex-1 max-w-full">
                <div class="max-w-full w-full">
                  <!-- Thinking Section -->
                  <div v-if="message.tools && message.tools.length > 0" class="bg-slate-50 border border-slate-200 rounded-lg mb-4 overflow-hidden">
                    <div 
                      class="bg-slate-100 p-3 cursor-pointer flex items-center justify-between font-medium text-slate-600 hover:bg-slate-200 transition-colors duration-200 select-none"
                      @click="toggleThinking(index)"
                      role="button"
                      :aria-expanded="message.thinkingExpanded"
                      aria-controls="thinking-content"
                    >
                      <span>🤔 Thinking...</span>
                      <span class="text-xs transition-transform duration-200" :class="{ 'rotate-180': message.thinkingExpanded }">▼</span>
                    </div>
                    <div 
                      id="thinking-content"
                      class="transition-all duration-300 overflow-hidden" 
                      :class="message.thinkingExpanded ? 'max-h-96 p-4' : 'max-h-0 p-0'"
                    >
                      <div class="max-h-96 overflow-y-auto scrollbar-thin">
                        <div v-for="(tool, toolIndex) in message.tools" :key="toolIndex" class="mb-3 p-3 bg-white rounded-md border-l-4 border-primary">
                          <div class="font-semibold text-primary text-sm mb-2">🔧 {{ tool.name }}</div>
                          <div class="bg-slate-50 p-2 rounded text-xs font-mono text-primary mb-2 break-all">{{ tool.input }}</div>
                          <div v-if="tool.reasoning" class="text-slate-600 italic text-xs leading-relaxed">💭 {{ tool.reasoning }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Bot Response Content -->
                  <div class="text-slate-700 max-w-full w-full">
                    <div class="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{{ message.content }}</div>
                    
                    <!-- Bot actions -->
                    <div class="flex items-center gap-4 mt-3 text-slate-400">
                       <button @click="copyMessage(message.content)" class="hover:text-slate-600 transition-colors" aria-label="Like response">
                           <ThumbsUp class="w-4 h-4" />
                       </button>
                       <button class="hover:text-slate-600 transition-colors" aria-label="Dislike response">
                           <ThumbsDown class="w-4 h-4" />
                       </button>
                       <button @click="copyMessage(message.content)" class="hover:text-slate-600 transition-colors" aria-label="Copy message">
                           <Copy class="w-4 h-4" />
                       </button>
                       <button class="hover:text-slate-600 transition-colors" aria-label="Share message">
                           <Share2 class="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- User Message -->
            <div v-else-if="message.role === 'user'" class="flex justify-end mb-6">
              <div class="max-w-2xl">
                <div class="bg-primary text-white p-4 rounded-xl rounded-br-none">
                  <p class="text-sm md:text-base leading-relaxed">{{ message.content }}</p>
                </div>
              </div>
            </div>

            <!-- System Message -->
            <div v-else-if="message.role === 'system'" class="flex justify-center mb-6">
              <div class="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm" role="status">
                {{ message.content }}
              </div>
            </div>
          </div>
          
          <!-- Loading Indicator -->
          <div v-if="chatStore.isTyping" class="flex gap-3 mb-6" role="status" aria-label="AI is typing">
            <div class="flex-1">
              <div class="text-slate-700 flex items-center gap-2">
                <span class="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                <span class="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style="animation-delay: 150ms;"></span>
                <span class="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style="animation-delay: 300ms;"></span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Floating Input Box -->
      <footer class="p-2 sm:p-4 w-full">
        <div class="max-w-4xl mx-auto transition-all duration-300" :class="{ 'md:max-w-6xl': !sidebarOpen }">
          <div class="bg-white border border-slate-200 rounded-xl shadow-lg p-2 sm:p-3">
            <!-- Error Message -->
            <div v-if="chatStore.errorMessage" class="text-red-500 text-sm mb-2" role="alert">
              {{ chatStore.errorMessage }}
            </div>
            
            <form @submit.prevent="sendMessage">
              <div>
                <!-- Text Input Container -->
                <div class="relative">
                  <textarea
                    ref="messageInput"
                    v-model="inputMessage"
                    @keydown.enter="handleEnterKey"
                    :disabled="chatStore.isLoading"
                    class="w-full bg-transparent p-2 text-slate-800 placeholder-slate-500 focus:outline-none resize-none scrollbar-thin"
                    rows="1"
                    placeholder="Ask about building rules and regulations..."
                    maxlength="4000"
                    aria-label="Message input"
                  ></textarea>
                  <!-- Floating Character Counter -->
                  <div class="absolute top-2 right-2 text-xs text-slate-400 pointer-events-none" aria-live="polite">
                    {{ inputMessage.length }}/4000
                  </div>
                </div>
                
                <!-- Bottom Controls Row -->
                <div class="flex items-center justify-between mt-2">
                  <!-- Left: File Upload, Think, Model -->
                  <div class="flex items-center gap-2">
                    <button type="button" class="flex items-center gap-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md px-3 py-1.5 flex-shrink-0 transition-colors" aria-label="Upload file">
                      <input type="file" @change="handleFileUpload" class="hidden" id="file-upload" accept="image/*,.pdf,.txt,.doc,.docx">
                      <label for="file-upload" class="cursor-pointer flex items-center gap-2">
                        <Plus class="w-4 h-4" />
                      </label>
                    </button>
                    <button
                      type="button"
                      @click="generateThought"
                      :disabled="chatStore.isThinking || chatStore.isLoading"
                      class="flex items-center gap-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md px-3 py-1.5 disabled:cursor-not-allowed disabled:bg-slate-200 flex-shrink-0 transition-colors"
                      aria-label="Generate thought"
                    >
                      <Lightbulb class="w-4 h-4" />
                      <span class="hidden sm:inline">Think</span>
                      <span class="sm:hidden">✨</span>
                    </button>
                    <select 
                      v-model="chatStore.selectedModel" 
                      class="hidden sm:block text-sm text-slate-600 bg-transparent border-0 focus:outline-none cursor-pointer hover:bg-slate-100 rounded-md px-2 py-1 max-w-48"
                      aria-label="Select AI Model"
                    >
                      <option value="openai/gpt-4.1-mini">GPT-4.1-Mini</option>
                      <option value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                      <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
                      <option value="qwen/qwen3-coder:floor">Qwen3 Coder</option>
                      <option value="">Grok 3 Mini</option>
                    </select>
                  </div>
                  
                  <!-- Right: Send/Stop Button -->
                  <div class="flex items-center">
                    <button
                      type="submit"
                      :disabled="(!inputMessage.trim() && !chatStore.isLoading) || chatStore.isThinking || inputMessage.length > 4000"
                      class="rounded-lg p-2 transition-colors flex-shrink-0"
                      :class="chatStore.isLoading ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-primary text-white hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed'"
                      :aria-label="chatStore.isLoading ? 'Stop generating' : 'Send message'"
                    >
                      <template v-if="chatStore.isLoading">
                        <div class="relative w-5 h-5 flex items-center justify-center">
                          <Square class="w-5 h-5" />
                          <div class="absolute w-2 h-2 bg-white rounded-sm"></div>
                        </div>
                      </template>
                      <template v-else>
                        <ArrowUp class="w-5 h-5" />
                      </template>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>
