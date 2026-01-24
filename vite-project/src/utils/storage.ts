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
  USER_PREFERENCES: 'user-preferences',
  UI_STATE: 'ui-state',
  THREADS_CACHE: 'threads-cache',
  MESSAGES_CACHE: 'messages-cache'
} as const

// Convenience functions for chat storage
export const ChatStorage = {
  saveUserPreferences: (preferences: Record<string, any>) => 
    LocalStorage.save(STORAGE_KEYS.USER_PREFERENCES, preferences),
  
  loadUserPreferences: (defaultValue: Record<string, any> = {}) => 
    LocalStorage.load(STORAGE_KEYS.USER_PREFERENCES, defaultValue),
  
  saveUIState: (state: Record<string, any>) => 
    LocalStorage.save(STORAGE_KEYS.UI_STATE, state),
  
  loadUIState: (defaultValue: Record<string, any> = {}) => 
    LocalStorage.load(STORAGE_KEYS.UI_STATE, defaultValue),
  
  saveThreadsCache: (userId: string, threads: any[], timestamp: number = Date.now()) => 
    LocalStorage.save(`${STORAGE_KEYS.THREADS_CACHE}-${userId}`, { threads, timestamp }),
  
  loadThreadsCache: (userId: string) => 
    LocalStorage.load<{ threads: any[]; timestamp: number }>(`${STORAGE_KEYS.THREADS_CACHE}-${userId}`),
  
  saveMessagesCache: (threadId: string, messages: any[], timestamp: number = Date.now()) => 
    LocalStorage.save(`${STORAGE_KEYS.MESSAGES_CACHE}-${threadId}`, { messages, timestamp }),
  
  loadMessagesCache: (threadId: string) => 
    LocalStorage.load<{ messages: any[]; timestamp: number }>(`${STORAGE_KEYS.MESSAGES_CACHE}-${threadId}`),
  
  removeMessagesCache: (threadId: string) => 
    LocalStorage.remove(`${STORAGE_KEYS.MESSAGES_CACHE}-${threadId}`)
}