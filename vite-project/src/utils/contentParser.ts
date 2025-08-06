/**
 * Content parser utility for parsing message content into segments
 * Handles markdown text and chart placeholder identification
 */

export interface ContentSegment {
  type: 'markdown' | 'chart'
  content?: string  // for markdown segments
  chartId?: number  // for chart segments
}

/**
 * Parse message content into an array of segments
 * Splits content by <chart id=X> tags and creates appropriate segments
 */
export function parseMessageContent(content: string): ContentSegment[] {
  if (!content) {
    return []
  }

  const segments: ContentSegment[] = []
  const chartRegex = /<chart\s+id\s*=\s*(\d+)\s*>/gi
  
  let lastIndex = 0
  let match

  while ((match = chartRegex.exec(content)) !== null) {
    const matchStart = match.index
    const matchEnd = chartRegex.lastIndex
    
    // Add markdown segment before the chart (if any content exists)
    if (matchStart > lastIndex) {
      const markdownContent = content.slice(lastIndex, matchStart).trim()
      if (markdownContent) {
        segments.push({
          type: 'markdown',
          content: markdownContent
        })
      }
    }
    
    // Add chart segment
    const chartId = parseInt(match[1], 10)
    segments.push({
      type: 'chart',
      chartId
    })
    
    lastIndex = matchEnd
  }
  
  // Add remaining markdown content after the last chart (if any)
  if (lastIndex < content.length) {
    const remainingContent = content.slice(lastIndex).trim()
    if (remainingContent) {
      segments.push({
        type: 'markdown',
        content: remainingContent
      })
    }
  }
  
  // If no charts were found, return the entire content as markdown
  if (segments.length === 0) {
    segments.push({
      type: 'markdown',
      content: content
    })
  }
  
  return segments
}

/**
 * Get all chart IDs referenced in content
 */
export function getReferencedChartIds(content: string): number[] {
  const chartRegex = /<chart\s+id\s*=\s*(\d+)\s*>/gi
  const ids: number[] = []
  let match
  
  while ((match = chartRegex.exec(content)) !== null) {
    const chartId = parseInt(match[1], 10)
    if (!ids.includes(chartId)) {
      ids.push(chartId)
    }
  }
  
  return ids
}

/**
 * Check if content contains any chart placeholders
 */
export function hasChartPlaceholders(content: string): boolean {
  const chartRegex = /<chart\s+id\s*=\s*\d+\s*>/gi
  return chartRegex.test(content)
}

/**
 * Get charts that are not referenced in the content
 * Used for displaying unreferenced charts after the message
 */
export function getUnreferencedCharts(content: string, charts: string[], chartOffset: number): string[] {
  if (!charts || charts.length === 0) return []
  
  const referencedIds = getReferencedChartIds(content)
  const unreferencedCharts: string[] = []
  
  charts.forEach((chart, index) => {
    const globalChartId = chartOffset + index + 1 // Calculate global chart ID
    if (!referencedIds.includes(globalChartId)) {
      unreferencedCharts.push(chart)
    }
  })
  
  return unreferencedCharts
}