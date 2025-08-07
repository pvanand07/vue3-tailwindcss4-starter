/**
 * Local Storage utilities for the chat application
 */

export interface StorageOptions {
  key: string
  defaultValue?: any
}

export class LocalStorage {
  /**
   * Save data to localStorage with error handling
   */
  static save<T>(key: string, data: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error(`Failed to save to localStorage (${key}):`, error)
      return false
    }
  }

  /**
   * Load data from localStorage with error handling
   */
  static load<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        return JSON.parse(stored) as T
      }
      return defaultValue
    } catch (error) {
      console.error(`Failed to load from localStorage (${key}):`, error)
      return defaultValue
    }
  }

  /**
   * Remove item from localStorage
   */
  static remove(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Failed to remove from localStorage (${key}):`, error)
      return false
    }
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, 'test')
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * Clear all localStorage data (use with caution)
   */
  static clear(): boolean {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
      return false
    }
  }

  /**
   * Get the size of localStorage in bytes (approximate)
   */
  static getSize(): number {
    let total = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  }
}

// Chat-specific storage keys
export const STORAGE_KEYS = {
  CHAT_HISTORY: 'chat-history',
  USER_PREFERENCES: 'user-preferences',
  UI_STATE: 'ui-state',
  SELECTED_MODEL: 'selected-model'
} as const

// Convenience functions for chat storage
export const ChatStorage = {
  saveChatHistory: (history: any[]) => 
    LocalStorage.save(STORAGE_KEYS.CHAT_HISTORY, history),
  
  loadChatHistory: (defaultValue: any[] = []) => 
    LocalStorage.load(STORAGE_KEYS.CHAT_HISTORY, defaultValue),
  
  saveUserPreferences: (preferences: Record<string, any>) => 
    LocalStorage.save(STORAGE_KEYS.USER_PREFERENCES, preferences),
  
  loadUserPreferences: (defaultValue: Record<string, any> = {}) => 
    LocalStorage.load(STORAGE_KEYS.USER_PREFERENCES, defaultValue),
  
  saveUIState: (state: Record<string, any>) => 
    LocalStorage.save(STORAGE_KEYS.UI_STATE, state),
  
  loadUIState: (defaultValue: Record<string, any> = {}) => 
    LocalStorage.load(STORAGE_KEYS.UI_STATE, defaultValue),
  
  saveSelectedModel: (model: string) => {
    console.log('💾 Storage - Saving selectedModel:', model)
    const result = LocalStorage.save(STORAGE_KEYS.SELECTED_MODEL, model)
    console.log('💾 Storage - Save result:', result)
    return result
  },
  
  loadSelectedModel: (defaultValue: string = 'openai/gpt-5-mini') => {
    const loaded = LocalStorage.load(STORAGE_KEYS.SELECTED_MODEL, defaultValue)
    console.log('💾 Storage - Loading selectedModel:', loaded, 'default:', defaultValue)
    return loaded || defaultValue
  }
}