/**
 * Date formatting utilities
 */

export class DateUtils {
  /**
   * Format date as relative time (e.g., "2 hours ago", "Yesterday")
   */
  static formatRelative(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    
    if (diffMinutes < 1) {
      return 'Just now'
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  /**
   * Format date for display in chat messages
   */
  static formatChatTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  /**
   * Format date for file names (YYYY-MM-DD_HH-mm-ss)
   */
  static formatForFilename(date: Date = new Date()): string {
    const pad = (num: number) => num.toString().padStart(2, '0')
    
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`
  }

  /**
   * Check if a date is today
   */
  static isToday(dateString: string): boolean {
    const date = new Date(dateString)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  /**
   * Check if a date is this week
   */
  static isThisWeek(dateString: string): boolean {
    const date = new Date(dateString)
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    
    return date >= weekStart && date <= weekEnd
  }

  /**
   * Get a human-readable time ago string
   */
  static timeAgo(dateString: string): string {
    return DateUtils.formatRelative(dateString)
  }
}