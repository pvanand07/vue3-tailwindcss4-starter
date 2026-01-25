<template>
  <!-- Mobile Backdrop Overlay -->
  <div 
    v-if="isOpen" 
    @click="$emit('close')"
    class="fixed inset-0 bg-black/50 z-40 md:hidden"
  />
  
  <aside 
    class="w-80 h-full flex flex-col z-50 fixed md:absolute md:left-0 bg-[var(--color-sidebar)] text-[var(--color-text-primary)] border-r border-[var(--color-border)] transition-all duration-300 ease-in-out gpu-accelerated"
    :class="{ '-translate-x-full': !isOpen }"
  >
    <!-- Sidebar Header -->
    <div class="p-4 border-b border-[var(--color-border)]">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-[var(--color-text-primary)] text-center w-full">XY-Intelligence</h2>
        <button 
          @click="$emit('close')"
          class="md:hidden p-1 hover:bg-[var(--color-icon-bg)] rounded text-[var(--color-icon-default)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="Close sidebar"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      <div class="space-y-2">
        <button 
          @click="handleNewChat"
          class="w-full bg-[var(--color-primary-blue)] text-white py-2 px-4 rounded-lg hover:bg-[var(--color-primary-blue-hover)] transition-colors flex items-center gap-2"
          aria-label="Start new chat"
        >
          <Plus class="w-4 h-4" />
          New Chat
        </button>
        <router-link
          to="/dashboard"
          class="w-full bg-[var(--color-icon-bg)] text-[var(--color-text-primary)] py-2 px-4 rounded-lg hover:bg-[var(--color-muted-blue)] transition-colors flex items-center gap-2"
          @click="$emit('close')"
        >
          <FileText class="w-4 h-4" />
          Dashboard
        </router-link>
      </div>
    </div>

    <!-- History List -->
    <div class="flex-1 overflow-y-auto scrollbar-thin p-2">
      <div v-if="chatStore.isLoadingThreads" class="text-center text-[var(--color-text-muted)] mt-8">
        <MessageCircle class="w-12 h-12 mx-auto mb-2 opacity-50 text-[var(--color-text-muted)] animate-pulse" />
        <p>Loading chats...</p>
      </div>
      
      <div v-else-if="chatStore.threads.length === 0" class="text-center text-[var(--color-text-muted)] mt-8">
        <MessageCircle class="w-12 h-12 mx-auto mb-2 opacity-50 text-[var(--color-text-muted)]" />
        <p>No chat history yet</p>
      </div>
      
      <div v-for="thread in chatStore.threads" :key="thread.id" class="mb-2 relative" :class="{'z-10': openDropdownId === thread.id}">
        <div 
          @click="handleLoadThread(thread)"
          class="p-3 rounded-lg cursor-pointer border border-transparent group relative transition-all duration-200 hover:bg-[var(--color-icon-bg)] hover:text-[var(--color-primary-blue)] hover:translate-x-1"
          :class="{ 'bg-[var(--color-muted-blue)] text-[var(--color-primary-blue)] dark:bg-[var(--color-icon-bg)] dark:text-[var(--color-icon-active)]': chatStore.currentThreadId === thread.id }"
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
                class="p-1 opacity-0 group-hover:opacity-100 hover:bg-[var(--color-icon-bg)] rounded transition-all text-[var(--color-icon-default)]"
                :class="{ 'opacity-100': deleteConfirmId === thread.id }"
                :aria-label="`Delete ${thread.title || 'Untitled Chat'}`"
              >
                <Trash2 class="w-4 h-4" />
              </button>
              <button 
                @click.stop="toggleOptionsMenu(thread.id)"
                class="p-1 opacity-0 group-hover:opacity-100 hover:bg-[var(--color-icon-bg)] rounded transition-all text-[var(--color-icon-default)]"
                :class="{ 'opacity-100': openDropdownId === thread.id }"
                :aria-label="`Options for ${thread.title || 'Untitled Chat'}`"
              >
                <MoreHorizontal class="w-4 h-4" />
              </button>
              
              <!-- Dropdown Menu -->
              <Transition name="fade">
                <div 
                  v-if="openDropdownId === thread.id"
                  class="absolute right-0 top-8 bg-[var(--color-surface)] rounded-lg shadow-lg border border-[var(--color-border)] py-1 min-w-[120px] z-50"
                >
                  <button 
                    @click.stop="handleRenameThread(thread)"
                    class="w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-icon-bg)] flex items-center gap-2 text-[var(--color-text-primary)]"
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
    <div class="p-4 border-t border-[var(--color-border)]">
      <div class="flex flex-col items-center space-y-2">
        <!-- Theme Toggle -->
        <div class="w-full flex items-center justify-center mb-2">
          <button
            @click="uiStore.toggleTheme()"
            class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm bg-[var(--color-icon-bg)] hover:bg-[var(--color-muted-blue)] text-[var(--color-text-primary)]"
            :aria-label="`Current theme: ${uiStore.theme}. Click to toggle theme`"
            :title="`Theme: ${uiStore.theme === 'system' ? 'System' : uiStore.theme === 'dark' ? 'Dark' : 'Light'}`"
          >
            <Sun v-if="uiStore.theme === 'light'" class="w-4 h-4" />
            <Moon v-else-if="uiStore.theme === 'dark'" class="w-4 h-4" />
            <Monitor v-else class="w-4 h-4" />
            <span class="text-xs font-medium">
              {{ uiStore.theme === 'system' ? 'System' : uiStore.theme === 'dark' ? 'Dark' : 'Light' }}
            </span>
          </button>
        </div>
        
        <!-- User ID Display/Edit -->
        <div class="w-full">
          <div v-if="!isEditingUserId" class="flex items-center justify-center">
            <span v-if="userId" class="text-sm text-[var(--color-text-secondary)] font-mono">
              {{ userId }}
            </span>
            <span v-else class="text-xs text-[var(--color-text-muted)]">
              User ID not set
            </span>
            <button 
              @click="startEditingUserId"
              class="ml-2 p-1 hover:bg-[var(--color-icon-bg)] rounded text-[var(--color-icon-default)] hover:text-[var(--color-icon-active)] transition-colors"
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
                class="flex-1 px-2 py-1 text-sm bg-[var(--color-surface)] border rounded text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none transition-colors"
                :class="userIdError ? 'border-[var(--color-error)] focus:border-[var(--color-error)]' : 'border-[var(--color-border)] focus:border-[var(--color-primary-blue)]'"
                ref="userIdInput"
              />
              <button 
                @click="saveUserId"
                class="p-1 bg-[var(--color-success)] hover:opacity-90 rounded text-white transition-colors"
                aria-label="Save user ID"
              >
                <Check class="w-3 h-3" />
              </button>
              <button 
                @click="cancelEditingUserId"
                class="p-1 bg-[var(--color-icon-bg)] hover:opacity-80 rounded text-[var(--color-icon-default)] hover:text-[var(--color-text-primary)] transition-colors"
                aria-label="Cancel editing"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
            <div v-if="userIdError" class="text-xs text-[var(--color-error)] px-2">
              {{ userIdError }}
            </div>
          </div>
        </div>
        
        <!-- Conversation Count -->
        <div class="text-xs text-[var(--color-text-muted)]">
          <span>{{ chatStore.threads.length }} conversation{{ chatStore.threads.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Plus, X, MoreHorizontal, Edit2, Trash2, MessageCircle, FileText, Check, Sun, Moon, Monitor } from 'lucide-vue-next'
import { useChatStore } from '../../stores/chat'
import { useUIStore } from '../../stores/ui'
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

// Use stores
const chatStore = useChatStore()
const uiStore = useUIStore()

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
  background: var(--color-border-subtle);
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: var(--color-text-muted);
  border-radius: 3px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: var(--color-icon-default);
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