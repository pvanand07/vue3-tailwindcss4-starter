<template>
  <div 
    ref="containerRef"
    class="markdown-content text-sm md:text-base leading-relaxed"
    v-html="renderedMarkdown"
  />
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch, onUnmounted, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'
import { markdownChartPlugin } from '../../../utils/markdownChartPlugin'
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  type ChartConfiguration
} from 'chart.js'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  PieController,
  DoughnutController
)

interface Props {
  content: string
  class?: string
}

const props = defineProps<Props>()

const containerRef = ref<HTMLElement | null>(null)
const chartInstances = ref<Chart[]>([])

// Configure markdown-it with sensible defaults
const md = new MarkdownIt({
  html: false, // Disable HTML tags for security
  linkify: true, // Auto-convert URLs to links
  breaks: true, // Convert '\n' to <br>
  typographer: true, // Enable smart quotes and other typographic replacements
})

// Add chart plugin
md.use(markdownChartPlugin)

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

const renderedMarkdown = computed(() => {
  return md.render(props.content)
})

// Function to parse chart configuration
const parseChartConfig = (configStr: string): ChartConfiguration | null => {
  try {
    let cleanConfig = configStr.trim()
    
    // Remove 'config = ' prefix if present
    if (cleanConfig.startsWith('config = ')) {
      cleanConfig = cleanConfig.substring('config = '.length)
    }
    
    // Use Function constructor for safer evaluation
    const configFunction = new Function('return ' + cleanConfig)
    const config = configFunction()
    
    // Validate required properties
    if (!config.type || !config.data) {
      throw new Error('Chart configuration must include "type" and "data" properties')
    }
    
    return config as ChartConfiguration
  } catch (err) {
    console.error('Failed to parse chart config:', err)
    return null
  }
}

// Function to render charts after markdown is processed
const renderCharts = async () => {
  await nextTick()
  
  if (!containerRef.value) return
  
  // Clean up existing charts
  chartInstances.value.forEach(chart => chart.destroy())
  chartInstances.value = []
  
  // Find chart containers and render charts
  const chartContainers = containerRef.value.querySelectorAll('.chart-container')
  
  chartContainers.forEach((container) => {
    const chartId = container.getAttribute('data-chart-id')
    const configStr = container.getAttribute('data-chart-config')
    
    if (!chartId || !configStr) return
    
    try {
      // Parse the configuration
      const config = parseChartConfig(configStr)
      
      if (!config) {
        container.innerHTML = `
          <div class="chart-error bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
            <div class="font-medium mb-1">Chart Error</div>
            <div class="text-sm">Invalid chart configuration</div>
          </div>
        `
        return
      }
      
      // Create canvas element
      const canvas = document.createElement('canvas')
      canvas.id = `chart-canvas-${chartId}`
      
      // Create wrapper with styling
      const wrapper = document.createElement('div')
      wrapper.className = 'chart-wrapper bg-white border border-slate-200 rounded-lg p-4 mb-4'
      wrapper.style.position = 'relative'
      wrapper.style.height = '300px'
      wrapper.style.width = '100%'
      
      canvas.style.position = 'absolute'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      
      wrapper.appendChild(canvas)
      container.appendChild(wrapper)
      
      // Ensure responsive options
      const chartConfig: ChartConfiguration = {
        ...config,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...config.options
        }
      }
      
      // Create chart
      const chart = new Chart(canvas, chartConfig)
      chartInstances.value.push(chart)
      
    } catch (err) {
      console.error('Failed to create chart:', err)
      container.innerHTML = `
        <div class="chart-error bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
          <div class="font-medium mb-1">Chart Error</div>
          <div class="text-sm">${err instanceof Error ? err.message : 'Unknown error occurred'}</div>
        </div>
      `
    }
  })
}

// Watch for content changes and re-render charts
watch(() => props.content, () => {
  renderCharts()
}, { flush: 'post' })

// Initial render of charts
onMounted(() => {
  renderCharts()
})

// Clean up charts on unmount
onUnmounted(() => {
  chartInstances.value.forEach(chart => chart.destroy())
  chartInstances.value = []
})
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

/* Chart container styling */
.markdown-content :deep(.chart-container) {
  @apply mb-4;
}

.markdown-content :deep(.chart-wrapper) {
  @apply bg-white border border-slate-200 rounded-lg p-4 mb-4;
  position: relative;
  height: 300px;
  width: 100%;
}

.markdown-content :deep(.chart-error) {
  @apply bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>