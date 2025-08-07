import type MarkdownIt from 'markdown-it'

// Generate unique ID for each chart
let chartCounter = 0
const generateChartId = (): string => {
  return `chart-${Date.now()}-${++chartCounter}`
}

// Plugin function for markdown-it
export function markdownChartPlugin(md: MarkdownIt): void {
  // Reset counter for each render
  chartCounter = 0

  // Custom rule to parse <chart> tags
  md.block.ruler.before('paragraph', 'chart', (state, start, end, silent) => {
    const pos = state.bMarks[start] + state.tShift[start]
    const max = state.eMarks[start]
    
    // Check if line starts with <chart>
    if (pos + 7 > max) return false
    if (state.src.slice(pos, pos + 7) !== '<chart>') return false
    
    // Find the closing </chart> tag
    let nextLine = start
    let chartContent = ''
    let foundClosing = false
    
    // Look for closing tag
    for (let i = start; i < end; i++) {
      const lineStart = state.bMarks[i] + state.tShift[i]
      const lineEnd = state.eMarks[i]
      const line = state.src.slice(lineStart, lineEnd)
      
      if (i === start) {
        // First line - remove <chart> tag
        const afterTag = line.slice(7).trim()
        if (afterTag) chartContent += afterTag + '\n'
      } else if (line.trim() === '</chart>') {
        foundClosing = true
        nextLine = i + 1
        break
      } else {
        chartContent += line + '\n'
      }
    }
    
    if (!foundClosing) return false
    if (silent) return true
    
    // Generate unique ID
    const chartId = generateChartId()
    
    // Create token for the chart
    const token = state.push('chart', 'div', 0)
    token.info = chartId
    token.content = chartContent.trim()
    token.map = [start, nextLine]
    
    state.line = nextLine
    return true
  })

  // Renderer for chart tokens
  md.renderer.rules.chart = (tokens, idx) => {
    const token = tokens[idx]
    const chartId = token.info
    const config = token.content
    
    // Escape the config for safe embedding in HTML
    const escapedConfig = md.utils.escapeHtml(config)
    
    return `<div class="chart-container" data-chart-id="${chartId}" data-chart-config="${escapedConfig}"></div>`
  }
}