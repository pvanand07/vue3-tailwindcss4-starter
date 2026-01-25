/**
 * Text manipulation utilities
 */

export class TextUtils {
  /**
   * Truncate text to a maximum length with ellipsis
   */
  static truncate(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - suffix.length) + suffix
  }

  /**
   * Generate a unique ID string
   */
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Debounce function calls
   */
  static debounce<T extends (...args: any[]) => void>(
    func: T, 
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  /**
   * Capitalize first letter of a string
   */
  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  /**
   * Convert kebab-case to Title Case
   */
  static kebabToTitle(text: string): string {
    return text
      .split('-')
      .map(word => TextUtils.capitalize(word))
      .join(' ')
  }

  /**
   * Clean and normalize text for search
   */
  static normalizeForSearch(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
  }

  /**
   * Extract first meaningful sentence for preview
   */
  static extractPreview(text: string, maxLength: number = 100): string {
    // Try to find the first sentence
    const sentences = text.split(/[.!?]+/)
    const firstSentence = sentences[0]?.trim()
    
    if (firstSentence && firstSentence.length <= maxLength) {
      return firstSentence
    }
    
    // Fall back to truncation
    return TextUtils.truncate(text.trim(), maxLength)
  }

  /**
   * Count words in text
   */
  static wordCount(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  /**
   * Validate if text is not empty/whitespace
   */
  static isNotEmpty(text: string): boolean {
    return text.trim().length > 0
  }

  /**
   * Format file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Generate a slug from text
   */
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  }
}

/**
 * Validate and sanitize user ID - only accepts email addresses
 * Returns the full email address as the username, or throws an error if invalid
 */
export const sanitizeUserId = (userId: string): string => {
  const trimmed = userId.trim()
  
  // Email validation regex pattern
  // Matches: local-part@domain
  // Allows: letters, numbers, dots, hyphens, underscores, plus signs in local part
  // Domain must have at least one dot and valid TLD
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  if (!emailRegex.test(trimmed)) {
    throw new Error('Please enter a valid email address')
  }
  
  // Return the full email address (normalized to lowercase for consistency)
  return trimmed.toLowerCase()
}

/**
 * Check if a string is a valid email address
 */
export const isValidEmail = (email: string): boolean => {
  const trimmed = email.trim()
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(trimmed)
}