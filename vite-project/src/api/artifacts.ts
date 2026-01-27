import type { ArtifactResponse } from '../types/chat'

// API Configuration
export const ARTIFACTS_CONFIG = {
  ENDPOINT: '/api/v1/artifacts'
} as const

/**
 * Fetch artifact data from the API
 * @param artifactId - The artifact UUID
 * @param userId - The user ID for authentication
 * @param threadId - Optional thread ID for scoping
 * @returns Promise with artifact response data
 */
export async function fetchArtifact(
  artifactId: string,
  userId: string,
  threadId?: string
): Promise<ArtifactResponse> {
  const params = new URLSearchParams({ user_id: userId })
  
  if (threadId) {
    params.append('thread_id', threadId)
  }

  const url = `${ARTIFACTS_CONFIG.ENDPOINT}/${artifactId}?${params}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Artifact ${artifactId} not found for user ${userId}`)
    }
    const errorText = await response.text()
    throw new Error(`Failed to fetch artifact: ${response.status} - ${errorText}`)
  }

  return response.json()
}

/**
 * Extract artifact data from API response
 * @param response - The artifact response from API
 * @returns The main content/output from the artifact
 */
export function extractArtifactContent(response: ArtifactResponse): string {
  return response.artifact_data.output || ''
}

/**
 * Check if artifact is a CSV type
 * @param artifactType - The MIME type of the artifact
 * @returns True if the artifact is CSV type
 */
export function isCsvArtifact(artifactType: string): boolean {
  return artifactType === 'text/csv'
}

/**
 * Check if artifact is a Plotly visualization
 * @param artifactType - The MIME type of the artifact
 * @returns True if the artifact is Plotly type
 */
export function isPlotlyArtifact(artifactType: string): boolean {
  return artifactType === 'application/vnd.plotly.v1+json'
}


