<template>
  <div 
    ref="markdownContainer"
    v-html="renderedMarkdown" 
    class="markdown-content text-sm md:text-base leading-relaxed"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'

interface Props {
  content: string
  charts?: string[]
  chartOffset?: number
  class?: string
}

const props = defineProps<Props>()

// Template ref for the container
const markdownContainer = ref<HTMLElement | null>(null)

// Configure markdown-it with sensible defaults
const md = new MarkdownIt({
  html: true, // Enable HTML tags for chart rendering
  linkify: true, // Auto-convert URLs to links
  breaks: true, // Convert '\n' to <br>
  typographer: true, // Enable smart quotes and other typographic replacements
})

// Custom renderer for code blocks to add proper CSS classes
md.renderer.rules.fence = (tokens: any[], idx: number) => {
  const token = tokens[idx]
  const info = token.info ? token.info.trim() : ''
  const lang = info ? info.split(/\s+/g)[0] : ''
  
  return `<div class="code-block">
    ${lang ? `<div class="code-header">${lang}</div>` : ''}
    <pre class="code-content"><code${lang ? ` class="language-${lang}"` : ''}>${md.utils.escapeHtml(token.content)}</code></pre>
  </div>`
}

// Custom renderer for inline code
md.renderer.rules.code_inline = (tokens: any[], idx: number) => {
  const token = tokens[idx]
  return `<code class="inline-code">${md.utils.escapeHtml(token.content)}</code>`
}

// Chart placeholder processing function
const processChartPlaceholders = (content: string, charts?: string[], chartOffset = 0): string => {
  if (!charts || charts.length === 0) {
    return content
  }

  // Regex to match <chart id=X> patterns
  const chartRegex = /<chart\s+id\s*=\s*(\d+)\s*>/gi
  
  return content.replace(chartRegex, (_, idStr) => {
    const globalChartId = parseInt(idStr, 10)
    const localChartIndex = globalChartId - chartOffset - 1 // Convert to local 0-based index
    
    if (localChartIndex >= 0 && localChartIndex < charts.length && charts[localChartIndex]) {
      // Wrap the chart SVG in a container with proper styling
      const chartSvg = charts[localChartIndex]
      return `<div class="chart-container my-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
        <div class="chart-wrapper">${chartSvg}</div>
      </div>`
    } else {
      // Return placeholder for invalid chart ID
      return `<div class="chart-error my-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p class="text-sm">⚠️ Chart ${globalChartId} not found (offset: ${chartOffset}, local index: ${localChartIndex})</p>
      </div>`
    }
  })
}

// Function to execute scripts in chart SVGs (similar to ChartRenderer.vue)
const executeChartScripts = () => {
  nextTick(() => {
    if (!markdownContainer.value) return
    
    const chartContainers = markdownContainer.value.querySelectorAll('.chart-wrapper')
    
    chartContainers.forEach(container => {
      const scripts = container.querySelectorAll('script')
      
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script')
        
        // The pygal script uses xlink:href
        const scriptUrl = oldScript.getAttribute('xlink:href')
        if (scriptUrl) {
          newScript.src = scriptUrl
        }

        // Copy inline script content
        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent
        }

        // Remove the old script from the SVG
        oldScript.parentNode?.removeChild(oldScript)
        
        // Append the new script to the document head to execute it
        document.head.appendChild(newScript)
      })
    })
  })
}

const renderedMarkdown = computed(() => {
  const processedContent = processChartPlaceholders(props.content, props.charts, props.chartOffset || 0)
  return md.render(processedContent)
})

// Watch for changes and execute scripts after render
watch(() => [props.content, props.charts, props.chartOffset], () => {
  executeChartScripts()
}, { flush: 'post' })
</script>

<style scoped>
@reference "../../../style.css";

.markdown-content :deep(h1) {
  @apply text-2xl font-bold text-slate-800 mt-6 mb-4 first:mt-0;
}

.markdown-content :deep(h2) {
  @apply text-xl font-bold text-slate-800 mt-5 mb-3 first:mt-0;
}

.markdown-content :deep(h3) {
  @apply text-lg font-semibold text-slate-700 mt-4 mb-2 first:mt-0;
}

.markdown-content :deep(h4) {
  @apply text-base font-semibold text-slate-700 mt-3 mb-2 first:mt-0;
}

.markdown-content :deep(h5) {
  @apply text-sm font-semibold text-slate-700 mt-3 mb-2 first:mt-0;
}

.markdown-content :deep(h6) {
  @apply text-sm font-medium text-slate-600 mt-3 mb-2 first:mt-0;
}

.markdown-content :deep(p) {
  @apply mb-4 last:mb-0;
}

.markdown-content :deep(ul) {
  @apply mb-4 pl-6 space-y-1;
}

.markdown-content :deep(ol) {
  @apply mb-4 pl-6 space-y-1;
}

.markdown-content :deep(li) {
  @apply list-disc;
}

.markdown-content :deep(ol li) {
  @apply list-decimal;
}

.markdown-content :deep(blockquote) {
  @apply border-l-4 border-slate-300 pl-4 py-2 mb-4 italic text-slate-600 bg-slate-50;
}

.markdown-content :deep(a) {
  @apply text-blue-600 hover:text-blue-800 underline;
}

.markdown-content :deep(strong) {
  @apply font-semibold text-slate-800;
}

.markdown-content :deep(em) {
  @apply italic;
}

.markdown-content :deep(hr) {
  @apply border-0 border-t border-slate-200 my-6;
}

.markdown-content :deep(table) {
  @apply w-full border-collapse border border-slate-300 mb-4;
}

.markdown-content :deep(th) {
  @apply border border-slate-300 px-3 py-2 bg-slate-100 font-semibold text-left;
}

.markdown-content :deep(td) {
  @apply border border-slate-300 px-3 py-2;
}

/* Code styling */
.markdown-content :deep(.code-block) {
  @apply mb-4 rounded-lg overflow-hidden bg-slate-900;
}

.markdown-content :deep(.code-header) {
  @apply bg-slate-800 text-slate-300 px-4 py-2 text-xs font-medium border-b border-slate-700;
}

.markdown-content :deep(.code-content) {
  @apply p-4 overflow-x-auto;
}

.markdown-content :deep(.code-content code) {
  @apply text-sm text-slate-100 font-mono;
}

.markdown-content :deep(.inline-code) {
  @apply bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono;
}

/* Improve spacing for nested lists */
.markdown-content :deep(li > ul),
.markdown-content :deep(li > ol) {
  @apply mt-2 mb-0;
}

/* Chart styling for inline charts */
.markdown-content :deep(.chart-container) {
  @apply max-w-full overflow-x-auto;
  max-width: 800px;
  max-height: 600px;
}

.markdown-content :deep(.chart-wrapper) {
  @apply min-h-[300px] flex items-center justify-center;
  max-height: 500px;
  overflow: hidden;
}

.markdown-content :deep(.chart-wrapper svg) {
  @apply max-w-full h-auto;
  min-height: 300px;
  max-width: 750px;
  max-height: 450px;
}

/* Style the chart elements */
.markdown-content :deep(.pygal-chart) {
  font-family: 'Inter', sans-serif;
}

.markdown-content :deep(.chart-wrapper .title) {
  @apply text-base font-semibold;
  fill: #374151;
}

.markdown-content :deep(.chart-wrapper .axis text) {
  @apply text-xs;
  fill: #6b7280;
}

.markdown-content :deep(.chart-wrapper .legend text) {
  @apply text-xs;
  fill: #374151;
}

/* Chart error styling */
.markdown-content :deep(.chart-error) {
  @apply text-center;
}
</style>