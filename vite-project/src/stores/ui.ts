import { defineStore } from 'pinia'
import { ref, computed, watchEffect } from 'vue'
import { ChatStorage } from '../utils/storage'

export interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  compactMode: boolean
  showThinking: boolean
  lastActiveChat: string | null
}

export const useUIStore = defineStore('ui', () => {
  // State
  const sidebarOpen = ref(true)
  const theme = ref<'light' | 'dark' | 'system'>('system')
  const compactMode = ref(false)
  const showThinking = ref(true)
  const lastActiveChat = ref<string | null>(null)
  const isMobile = ref(false)

  // Computed
  const effectiveTheme = computed(() => {
    if (theme.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme.value
  })

  const shouldAutoCloseSidebar = computed(() => {
    // Only auto-close when navigating between chats on mobile
    return isMobile.value
  })

  // Mobile detection
  const updateMobileState = () => {
    const wasMobile = isMobile.value
    isMobile.value = window.innerWidth < 768
    
    // Only auto-close sidebar when switching from desktop to mobile
    // This allows users to manually open the sidebar on mobile
    if (!wasMobile && isMobile.value && sidebarOpen.value) {
      sidebarOpen.value = false
    }
  }

  // Actions
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
    saveUIState()
  }

  const closeSidebar = () => {
    sidebarOpen.value = false
    saveUIState()
  }

  const openSidebar = () => {
    sidebarOpen.value = true
    saveUIState()
  }

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    theme.value = newTheme
    saveUIState()
    applyTheme()
  }

  const toggleCompactMode = () => {
    compactMode.value = !compactMode.value
    saveUIState()
  }

  const toggleShowThinking = () => {
    showThinking.value = !showThinking.value
    saveUIState()
  }

  const setLastActiveChat = (chatId: string | null) => {
    lastActiveChat.value = chatId
    saveUIState()
  }

  // Auto-close sidebar on mobile when navigating
  const handleChatNavigation = () => {
    if (shouldAutoCloseSidebar.value) {
      closeSidebar()
    }
  }

  // Persistence
  const saveUIState = () => {
    const state: UIState = {
      sidebarOpen: sidebarOpen.value,
      theme: theme.value,
      compactMode: compactMode.value,
      showThinking: showThinking.value,
      lastActiveChat: lastActiveChat.value
    }
    
    ChatStorage.saveUIState(state)
  }

  const loadUIState = () => {
    const defaultState: UIState = {
      sidebarOpen: true,
      theme: 'system',
      compactMode: false,
      showThinking: true,
      lastActiveChat: null
    }
    
    const saved = ChatStorage.loadUIState(defaultState)
    
    if (saved) {
      sidebarOpen.value = saved.sidebarOpen
      theme.value = saved.theme
      compactMode.value = saved.compactMode
      showThinking.value = saved.showThinking
      lastActiveChat.value = saved.lastActiveChat
    }
    
    applyTheme()
  }

  // Theme application
  const applyTheme = () => {
    const root = document.documentElement
    const currentTheme = effectiveTheme.value
    
    root.classList.remove('light', 'dark')
    root.classList.add(currentTheme)
    
    // Update meta theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', currentTheme === 'dark' ? '#1e293b' : '#ffffff')
    }
  }

  // Initialize
  const initialize = () => {
    loadUIState()
    updateMobileState()
    
    // Listen for resize events
    window.addEventListener('resize', updateMobileState)
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (theme.value === 'system') {
          applyTheme()
        }
      })
    
    // Note: Removed watchEffect that was preventing sidebar from opening on mobile
    // Users can now manually open/close the sidebar on mobile devices
  }

  // Cleanup
  const cleanup = () => {
    window.removeEventListener('resize', updateMobileState)
  }

  return {
    // State
    sidebarOpen,
    theme,
    compactMode,
    showThinking,
    lastActiveChat,
    isMobile,
    
    // Computed
    effectiveTheme,
    shouldAutoCloseSidebar,
    
    // Actions
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setTheme,
    toggleCompactMode,
    toggleShowThinking,
    setLastActiveChat,
    handleChatNavigation,
    saveUIState,
    loadUIState,
    initialize,
    cleanup
  }
})