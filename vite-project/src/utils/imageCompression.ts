/**
 * Image Compression Utility
 * Compresses images to reduce localStorage usage
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  mimeType?: string
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.7,
  mimeType: 'image/jpeg'
}

/**
 * Compress a base64 image string
 * @param base64String - Base64 image data (with or without data URL prefix)
 * @param options - Compression options
 * @returns Compressed base64 string (without data URL prefix)
 */
export async function compressBase64Image(
  base64String: string,
  options: CompressionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  return new Promise((resolve, reject) => {
    // Create an image element
    const img = new Image()
    
    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img
        
        if (width > opts.maxWidth || height > opts.maxHeight) {
          const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        
        // Create canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        // Draw image on canvas
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to compressed base64
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'))
              return
            }
            
            const reader = new FileReader()
            reader.onloadend = () => {
              const result = reader.result as string
              // Remove data URL prefix
              const base64 = result.split(',')[1]
              resolve(base64)
            }
            reader.onerror = () => reject(new Error('Failed to read blob'))
            reader.readAsDataURL(blob)
          },
          opts.mimeType,
          opts.quality
        )
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    
    // Set image source
    // Handle both with and without data URL prefix
    if (base64String.startsWith('data:')) {
      img.src = base64String
    } else {
      // Try to detect format from base64 header
      let mimeType = 'image/jpeg'
      if (base64String.startsWith('iVBORw0KGgo')) {
        mimeType = 'image/png'
      } else if (base64String.startsWith('R0lGOD')) {
        mimeType = 'image/gif'
      } else if (base64String.startsWith('UklGR')) {
        mimeType = 'image/webp'
      }
      img.src = `data:${mimeType};base64,${base64String}`
    }
  })
}

/**
 * Compress an array of base64 images
 * @param images - Array of base64 image strings
 * @param options - Compression options
 * @returns Array of compressed base64 strings
 */
export async function compressImages(
  images: string[],
  options: CompressionOptions = {}
): Promise<string[]> {
  if (!images || images.length === 0) {
    return []
  }
  
  const compressionPromises = images.map(img => 
    compressBase64Image(img, options).catch(err => {
      console.error('Failed to compress image:', err)
      return img // Return original on error
    })
  )
  
  return Promise.all(compressionPromises)
}

/**
 * Calculate approximate size of base64 string in MB
 * @param base64String - Base64 string
 * @returns Size in MB
 */
export function calculateBase64Size(base64String: string): number {
  const bytes = base64String.length * 0.75 // Base64 is ~75% efficient
  return bytes / (1024 * 1024)
}

/**
 * Calculate total size of an array of base64 strings
 * @param images - Array of base64 strings
 * @returns Total size in MB
 */
export function calculateTotalImageSize(images: string[]): number {
  if (!images || images.length === 0) return 0
  return images.reduce((total, img) => total + calculateBase64Size(img), 0)
}
