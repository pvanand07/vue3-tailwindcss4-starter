<template>
  <!-- Mobile Backdrop Overlay -->
  <div 
    v-if="isOpen" 
    @click="$emit('close')"
    class="fixed inset-0 bg-black/50 z-40 md:hidden"
  />
  
  <aside 
    class="w-80 h-full flex flex-col z-50 fixed md:absolute md:left-0 bg-primary text-slate-200 border-r border-slate-600 transition-transform duration-300 ease-in-out gpu-accelerated"
    :class="{ '-translate-x-full': !isOpen }"
  >
    <!-- Sidebar Header -->
    <div class="p-4 border-b border-slate-600">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white text-center w-full">XY-Intelligence</h2>
        <button 
          @click="$emit('close')"
          class="md:hidden p-1 hover:bg-slate-600 rounded text-white"
          aria-label="Close sidebar"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      <div class="space-y-2">
        <button 
          @click="handleNewChat"
          class="w-full bg-slate-600 text-white py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
          aria-label="Start new chat"
        >
          <Plus class="w-4 h-4" />
          New Chat
        </button>
        <router-link
          to="/dashboard"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          @click="$emit('close')"
        >
          <FileText class="w-4 h-4" />
          Dashboard
        </router-link>
      </div>
    </div>

    <!-- History List -->
    <div class="flex-1 overflow-y-auto scrollbar-thin p-2">
      <div v-if="chatStore.isLoadingThreads" class="text-center text-slate-400 mt-8">
        <MessageCircle class="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-400 animate-pulse" />
        <p>Loading chats...</p>
      </div>
      
      <div v-else-if="chatStore.threads.length === 0" class="text-center text-slate-400 mt-8">
        <MessageCircle class="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-400" />
        <p>No chat history yet</p>
      </div>
      
      <div v-for="thread in chatStore.threads" :key="thread.id" class="mb-2 relative" :class="{'z-10': openDropdownId === thread.id}">
        <div 
          @click="handleLoadThread(thread)"
          class="p-3 rounded-lg cursor-pointer border border-transparent group relative transition-all duration-200 hover:bg-slate-700 hover:translate-x-1"
          :class="{ 'bg-slate-700 text-white': chatStore.currentThreadId === thread.id }"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-sm truncate mb-1">
                {{ thread.title || 'Untitled Chat' }}
              </h3>
              <p class="text-xs opacity-50 mt-1">
                {{ chatStore.formatDate(thread.updated_at) }}
              </p>
            </div>
            <!-- Options Dropdown -->
            <div class="relative flex items-center gap-1">
              <!-- Delete Confirmation (inline) -->
              <div v-if="deleteConfirmId === thread.id" class="flex items-center space-x-1 bg-red-50 border border-red-200 rounded-md px-2 py-1">
                <span class="text-xs text-red-700 font-medium">Delete?</span>
                <button
                  @click.stop="confirmDeleteThread(thread.id)"
                  class="text-red-600 hover:text-red-700 hover:bg-red-100 rounded px-1.5 py-0.5 text-xs font-medium transition-colors"
                  title="Confirm delete"
                >
                  Yes
                </button>
                <button
                  @click.stop="cancelDeleteThread"
                  class="text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded px-1.5 py-0.5 text-xs font-medium transition-colors"
                  title="Cancel"
                >
                  Cancel
                </button>
              </div>
              <button 
                v-else
                @click.stop="showDeleteConfirm(thread.id)"
                class="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-600 hover:bg-opacity-50 rounded transition-all text-slate-300"
                :class="{ 'opacity-100': deleteConfirmId === thread.id }"
                :aria-label="`Delete ${thread.title || 'Untitled Chat'}`"
              >
                <Trash2 class="w-4 h-4" />
              </button>
              <button 
                @click.stop="toggleOptionsMenu(thread.id)"
                class="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-600 hover:bg-opacity-50 rounded transition-all text-slate-300"
                :class="{ 'opacity-100': openDropdownId === thread.id }"
                :aria-label="`Options for ${thread.title || 'Untitled Chat'}`"
              >
                <MoreHorizontal class="w-4 h-4" />
              </button>
              
              <!-- Dropdown Menu -->
              <Transition name="fade">
                <div 
                  v-if="openDropdownId === thread.id"
                  class="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[120px] z-50"
                >
                  <button 
                    @click.stop="handleRenameThread(thread)"
                    class="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Edit2 class="w-3 h-3" />
                    Rename
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
      <div class="flex flex-col items-center space-y-2">
        <!-- User ID Display/Edit -->
        <div class="w-full">
          <div v-if="!isEditingUserId" class="flex items-center justify-center">
            <span v-if="userId" class="text-sm text-slate-300 font-mono">
              {{ userId }}
            </span>
            <span v-else class="text-xs text-slate-400">
              User ID not set
            </span>
            <button 
              @click="startEditingUserId"
              class="ml-2 p-1 hover:bg-slate-600 rounded text-slate-400 hover:text-white transition-colors"
              aria-label="Edit user ID"
            >
              <Edit2 class="w-3 h-3" />
            </button>
          </div>
          
          <!-- User ID Edit Form -->
          <div v-else class="flex flex-col space-y-2">
            <div class="flex items-center space-x-2">
              <input
                v-model="editingUserId"
                @keyup.enter="saveUserId"
                @keyup.esc="cancelEditingUserId"
                @input="userIdError = null"
                type="email"
                placeholder="Enter email address"
                class="flex-1 px-2 py-1 text-sm bg-slate-700 border rounded text-white placeholder-slate-400 focus:outline-none transition-colors"
                :class="userIdError ? 'border-red-500 focus:border-red-400' : 'border-slate-500 focus:border-blue-400'"
                ref="userIdInput"
              />
              <button 
                @click="saveUserId"
                class="p-1 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
                aria-label="Save user ID"
              >
                <Check class="w-3 h-3" />
              </button>
              <button 
                @click="cancelEditingUserId"
                class="p-1 bg-slate-600 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
                aria-label="Cancel editing"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
            <div v-if="userIdError" class="text-xs text-red-400 px-2">
              {{ userIdError }}
            </div>
          </div>
        </div>
        
        <!-- Conversation Count -->
        <div class="text-xs text-slate-400">
          <span>{{ chatStore.threads.length }} conversation{{ chatStore.threads.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Plus, X, MoreHorizontal, Edit2, Trash2, MessageCircle, FileText, Check } from 'lucide-vue-next'
import { useChatStore } from '../../stores/chat'
import { sanitizeUserId } from '../../utils/text'
import type { Thread } from '../../types/chat'

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
const deleteConfirmId = ref<string | null>(null)
const isEditingUserId = ref(false)
// Use computed to reactively get userId from store
const userId = computed(() => chatStore.userId)
const editingUserId = ref<string | null>(null)
const userIdInput = ref<HTMLInputElement | null>(null)
const userIdError = ref<string | null>(null)

// Handlers
const handleNewChat = () => {
  chatStore.startNewChat()
  
  // Close sidebar on mobile
  if (window.innerWidth < 768) {
    emit('close')
  }
  
  emit('chat-loaded')
}

const handleLoadThread = async (thread: Thread) => {
  console.log('📱 ChatSidebar: handleLoadThread called:', {
    threadId: thread.id,
    threadTitle: thread.title,
    currentThreadId: chatStore.currentThreadId
  })

  await chatStore.loadThread(thread)
  
  // Close sidebar on mobile after selection
  if (window.innerWidth < 768) {
    emit('close')
  }
  
  emit('chat-loaded')

  console.log('📱 ChatSidebar: After loadThread, currentThreadId:', chatStore.currentThreadId)
}

const toggleOptionsMenu = (threadId: string) => {
  if (openDropdownId.value === threadId) {
    openDropdownId.value = null
    deleteConfirmId.value = null
  } else {
    openDropdownId.value = threadId
    deleteConfirmId.value = null
  }
}

const handleRenameThread = async (thread: Thread) => {
  openDropdownId.value = null
  const newTitle = prompt('Enter new chat title:', thread.title || '')
  if (!newTitle || newTitle === thread.title) return
  
  await chatStore.renameThread(thread.id, newTitle)
}

const showDeleteConfirm = (threadId: string) => {
  deleteConfirmId.value = threadId
  openDropdownId.value = null // Close dropdown when showing delete confirmation
}

const confirmDeleteThread = async (threadId: string) => {
  deleteConfirmId.value = null
  openDropdownId.value = null
  await chatStore.deleteThread(threadId)
}

const cancelDeleteThread = () => {
  deleteConfirmId.value = null
}

const startEditingUserId = () => {
  isEditingUserId.value = true
  editingUserId.value = chatStore.userId || ''
  userIdError.value = null
  nextTick(() => {
    userIdInput.value?.focus()
  })
}

const saveUserId = () => {
  if (!editingUserId.value) {
    userIdError.value = 'Please enter an email address'
    return
  }
  
  try {
    const sanitized = sanitizeUserId(editingUserId.value)
    userIdError.value = null
    isEditingUserId.value = false
    chatStore.setUserId(sanitized)
  } catch (error: any) {
    userIdError.value = error.message || 'Please enter a valid email address'
  }
}

const cancelEditingUserId = () => {
  isEditingUserId.value = false
  editingUserId.value = chatStore.userId || ''
  userIdError.value = null
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