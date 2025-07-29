<template>
  <aside 
    class="w-80 h-full flex flex-col z-40 fixed md:absolute md:left-0 bg-primary text-slate-200 border-r border-slate-600 transition-transform duration-300 ease-in-out gpu-accelerated"
    :class="{ '-translate-x-full': !isOpen }"
  >
    <!-- Sidebar Header -->
    <div class="p-4 border-b border-slate-600">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white text-center w-full">D Code</h2>
        <button 
          @click="$emit('close')"
          class="md:hidden p-1 hover:bg-slate-600 rounded text-white"
          aria-label="Close sidebar"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      <button 
        @click="handleNewChat"
        class="w-full bg-slate-600 text-white py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
        aria-label="Start new chat"
      >
        <Plus class="w-4 h-4" />
        New Chat
      </button>
    </div>

    <!-- History List -->
    <div class="flex-1 overflow-y-auto scrollbar-thin p-2">
      <div v-if="chatStore.chatHistory.length === 0" class="text-center text-slate-400 mt-8">
        <MessageCircle class="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-400" />
        <p>No chat history yet</p>
      </div>
      
      <div v-for="chat in chatStore.chatHistory" :key="chat._id" class="mb-2 relative" :class="{'z-10': openDropdownId === chat._id}">
        <div 
          @click="handleLoadChat(chat)"
          class="p-3 rounded-lg cursor-pointer border border-transparent group relative transition-all duration-200 hover:bg-slate-700 hover:translate-x-1"
          :class="{ 'bg-slate-700 text-white': chatStore.currentChatId === chat._id }"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-sm truncate mb-1">
                {{ chat.title || 'Untitled Chat' }}
              </h3>
              <p class="text-xs opacity-70 truncate">
                {{ chatStore.getLastMessage(chat) }}
              </p>
              <p class="text-xs opacity-50 mt-1">
                {{ chatStore.formatDate(chat.updatedAt) }}
              </p>
            </div>
            <!-- Options Dropdown -->
            <div class="relative">
              <button 
                @click.stop="toggleOptionsMenu(chat._id)"
                class="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-600 hover:bg-opacity-50 rounded transition-all text-slate-300"
                :class="{ 'opacity-100': openDropdownId === chat._id }"
                :aria-label="`Options for ${chat.title || 'Untitled Chat'}`"
              >
                <MoreHorizontal class="w-4 h-4" />
              </button>
              
              <!-- Dropdown Menu -->
              <Transition name="fade">
                <div 
                  v-if="openDropdownId === chat._id"
                  class="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[120px] z-50"
                >
                  <button 
                    @click.stop="handleRenameChat(chat)"
                    class="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Edit2 class="w-3 h-3" />
                    Rename
                  </button>
                  <button 
                    @click.stop="handleDeleteChat(chat._id)"
                    class="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 class="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar Footer -->
    <div class="p-4 border-t border-slate-600">
      <div class="flex justify-center items-center text-xs text-slate-400">
        <span>{{ chatStore.chatHistory.length }} conversation{{ chatStore.chatHistory.length !== 1 ? 's' : '' }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, X, MoreHorizontal, Edit2, Trash2, MessageCircle } from 'lucide-vue-next'
import { useChatStore } from '../../stores/chat'
import type { Chat } from '../../types/chat'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'chat-loaded'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Use chat store
const chatStore = useChatStore()

// Local state
const openDropdownId = ref<string | null>(null)

// Handlers
const handleNewChat = () => {
  chatStore.startNewChat()
  
  // Close sidebar on mobile
  if (window.innerWidth < 768) {
    emit('close')
  }
  
  emit('chat-loaded')
}

const handleLoadChat = (chat: Chat) => {
  chatStore.loadChat(chat)
  
  // Close sidebar on mobile after selection
  if (window.innerWidth < 768) {
    emit('close')
  }
  
  emit('chat-loaded')
}

const toggleOptionsMenu = (chatId: string) => {
  openDropdownId.value = openDropdownId.value === chatId ? null : chatId
}

const handleRenameChat = (chat: Chat) => {
  openDropdownId.value = null
  const newTitle = prompt('Enter new chat title:', chat.title)
  if (!newTitle || newTitle === chat.title) return
  
  chatStore.renameChat(chat._id, newTitle)
}

const handleDeleteChat = (chatId: string) => {
  openDropdownId.value = null
  if (!confirm('Are you sure you want to delete this chat?')) return
  
  chatStore.deleteChat(chatId)
}

// Lifecycle
onMounted(() => {
  // Close dropdown on outside click
  document.addEventListener('click', () => {
    openDropdownId.value = null
  })
})
</script>

<style scoped>
/* Custom scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animation improvements */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Performance optimizations */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}
</style> 