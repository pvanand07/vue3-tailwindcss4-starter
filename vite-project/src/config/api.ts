// API Configuration
// For production, these should ideally come from environment variables

export const API_CONFIG = {
  // External API base URL - used for direct calls (e.g., file uploads)
  EXTERNAL_BASE_URL: 'https://fmcg-agent.elevatics.site/api/v1',
  
  // Proxy base URL - used for proxied calls through Vercel handler
  PROXY_BASE_URL: '/api/v1',
  
  // API Key for direct external API calls
  API_KEY: '44d5c2ac18ced6fc25c1e57dcdfygmdmrstt4577bf56e67540671a647465df4',
  
  // Whether to use direct endpoint for uploads (bypass proxy)
  // Set to true to bypass Vercel proxy for file uploads
  USE_DIRECT_UPLOAD: true
} as const

/**
 * Get the upload endpoint URL
 * Returns direct external URL if USE_DIRECT_UPLOAD is true, otherwise proxy URL
 */
export function getUploadEndpoint(): string {
  if (API_CONFIG.USE_DIRECT_UPLOAD) {
    return `${API_CONFIG.EXTERNAL_BASE_URL}/upload`
  }
  return `${API_CONFIG.PROXY_BASE_URL}/upload`
}

