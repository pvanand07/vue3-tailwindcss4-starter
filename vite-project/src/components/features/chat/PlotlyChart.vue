<template>
  <div class="plotly-chart-container">
    <div v-if="error" class="error-message">
      <span class="text-red-500">⚠️ Failed to render visualization: {{ error }}</span>
    </div>
    <div v-else class="chart-card">
      <!-- Chart Header with Title and Controls -->
      <div v-if="chartTitle" class="chart-header">
        <h3 class="chart-title">{{ chartTitle }}</h3>
        <div class="chart-controls">
          <button @click="zoomIn" class="control-button" title="Zoom in" aria-label="Zoom in">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button @click="zoomOut" class="control-button" title="Zoom out" aria-label="Zoom out">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button @click="panMode" class="control-button" :class="{ active: isPanMode }" title="Pan" aria-label="Pan">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"></path>
            </svg>
          </button>
          <button @click="resetView" class="control-button" title="Reset view" aria-label="Reset view">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M3 21v-5h5"></path>
            </svg>
          </button>
          <div class="control-divider"></div>
          <button @click="downloadChart" class="control-button" title="Download chart as PNG" aria-label="Download chart">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
        </div>
      </div>
      <div ref="chartContainer" class="chart-wrapper"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Plotly from 'plotly.js-dist-min'

interface Props {
  plotlyFigJson: string
}

const props = defineProps<Props>()
const chartContainer = ref<HTMLElement | null>(null)
const error = ref<string>('')
const resizeObserver = ref<ResizeObserver | null>(null)
const chartTitle = ref<string>('')
const isPanMode = ref<boolean>(false)

const renderChart = () => {
  if (!chartContainer.value) {
    return
  }

  try {
    // Parse the Plotly figure JSON
    const figData = JSON.parse(props.plotlyFigJson)
    
    if (!figData.data || !Array.isArray(figData.data)) {
      throw new Error('Invalid Plotly figure data')
    }

    // Extract title from layout
    chartTitle.value = figData.layout?.title?.text || figData.layout?.title || ''

    // Extract data, layout, and config from the figure
    const data = figData.data
    const layout = {
      ...figData.layout,
      autosize: true,
      // Hide title in chart since we're showing it in the header
      title: undefined,
      margin: { t: 20, r: 30, b: 50, l: 70 },
      paper_bgcolor: 'var(--color-surface)',
      plot_bgcolor: 'var(--color-surface)',
      font: {
        color: 'var(--color-text-primary)',
        family: 'system-ui, -apple-system, sans-serif',
        size: 12
      },
      xaxis: {
        ...figData.layout?.xaxis,
        gridcolor: 'var(--color-border)',
        linecolor: 'var(--color-border)',
        zerolinecolor: 'var(--color-border)',
        showspikes: true,
        spikemode: 'across',
        spikesnap: 'cursor',
        spikecolor: 'var(--color-primary-blue)',
        spikethickness: 1
      },
      yaxis: {
        ...figData.layout?.yaxis,
        gridcolor: 'var(--color-border)',
        linecolor: 'var(--color-border)',
        zerolinecolor: 'var(--color-border)',
        showspikes: true,
        spikemode: 'across',
        spikesnap: 'cursor',
        spikecolor: 'var(--color-primary-blue)',
        spikethickness: 1
      },
      hovermode: 'closest',
      hoverlabel: {
        bgcolor: 'var(--color-surface)',
        bordercolor: 'var(--color-border)',
        font: {
          size: 12,
          color: 'var(--color-text-primary)',
          family: 'system-ui, -apple-system, sans-serif'
        }
      },
      modebar: {
        bgcolor: 'rgba(0,0,0,0)',
        color: 'var(--color-icon-default)',
        activecolor: 'var(--color-primary-blue)',
        orientation: 'v'
      }
    }
    const config = {
      ...figData.config,
      responsive: true,
      displayModeBar: false, // Hide default modebar since we have custom controls
      displaylogo: false,
      scrollZoom: true,
      doubleClick: 'reset' as const,
      showTips: true
    }

    // Render the chart
    Plotly.newPlot(chartContainer.value, data, layout, config)
    error.value = ''
  } catch (e) {
    console.error('Error rendering Plotly chart:', e)
    error.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

const handleResize = () => {
  if (chartContainer.value) {
    Plotly.Plots.resize(chartContainer.value)
  }
}

const zoomIn = () => {
  if (!chartContainer.value) return
  Plotly.relayout(chartContainer.value, {
    'xaxis.range[0]': null,
    'xaxis.range[1]': null,
    'yaxis.range[0]': null,
    'yaxis.range[1]': null
  })
  // Trigger a zoom by adjusting the range
  const layout = (chartContainer.value as any).layout
  if (layout.xaxis && layout.yaxis) {
    const xRange = layout.xaxis.range || [0, 1]
    const yRange = layout.yaxis.range || [0, 1]
    const xMid = (xRange[0] + xRange[1]) / 2
    const yMid = (yRange[0] + yRange[1]) / 2
    const xSpan = (xRange[1] - xRange[0]) * 0.4
    const ySpan = (yRange[1] - yRange[0]) * 0.4
    Plotly.relayout(chartContainer.value, {
      'xaxis.range': [xMid - xSpan, xMid + xSpan],
      'yaxis.range': [yMid - ySpan, yMid + ySpan]
    })
  }
}

const zoomOut = () => {
  if (!chartContainer.value) return
  const layout = (chartContainer.value as any).layout
  if (layout.xaxis && layout.yaxis) {
    const xRange = layout.xaxis.range || [0, 1]
    const yRange = layout.yaxis.range || [0, 1]
    const xMid = (xRange[0] + xRange[1]) / 2
    const yMid = (yRange[0] + yRange[1]) / 2
    const xSpan = (xRange[1] - xRange[0]) * 1.25
    const ySpan = (yRange[1] - yRange[0]) * 1.25
    Plotly.relayout(chartContainer.value, {
      'xaxis.range': [xMid - xSpan, xMid + xSpan],
      'yaxis.range': [yMid - ySpan, yMid + ySpan]
    })
  }
}

const panMode = () => {
  if (!chartContainer.value) return
  isPanMode.value = !isPanMode.value
  Plotly.relayout(chartContainer.value, {
    dragmode: isPanMode.value ? 'pan' : 'zoom'
  })
}

const resetView = () => {
  if (!chartContainer.value) return
  Plotly.relayout(chartContainer.value, {
    'xaxis.autorange': true,
    'yaxis.autorange': true
  })
}

const downloadChart = async () => {
  if (!chartContainer.value) return
  
  try {
    // Use Plotly's built-in image export
    const imgData = await Plotly.toImage(chartContainer.value, {
      format: 'png',
      width: 1200,
      height: 800,
      scale: 2
    })
    
    // Create download link
    const link = document.createElement('a')
    link.download = `${chartTitle.value || 'chart'}.png`.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    link.href = imgData
    link.click()
  } catch (e) {
    console.error('Error downloading chart:', e)
  }
}

onMounted(() => {
  renderChart()

  // Setup resize observer for responsive charts
  if (chartContainer.value) {
    resizeObserver.value = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.value.observe(chartContainer.value)
  }

  // Also listen to window resize as fallback
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  // Cleanup
  if (chartContainer.value) {
    Plotly.purge(chartContainer.value)
  }
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
  window.removeEventListener('resize', handleResize)
})

// Watch for prop changes and re-render
watch(() => props.plotlyFigJson, () => {
  renderChart()
})
</script>

<style scoped>
.plotly-chart-container {
  width: 100%;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.chart-card {
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  overflow: hidden;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  gap: 1rem;
}

.chart-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
  line-height: 1.5;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.control-divider {
  width: 1px;
  height: 20px;
  background: var(--color-border);
  margin: 0 0.25rem;
}

.control-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: transparent;
  color: var(--color-icon-default);
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-button:hover {
  background: var(--color-icon-bg);
  color: var(--color-primary-blue);
}

.control-button.active {
  background: var(--color-primary-blue);
  color: white;
}

.control-button:active {
  transform: scale(0.95);
}

.control-button svg {
  flex-shrink: 0;
}

.chart-wrapper {
  width: 100%;
  min-height: 400px;
  background: var(--color-surface);
  position: relative;
}

/* Hide default Plotly modebar since we have custom controls */
.chart-wrapper :deep(.modebar) {
  display: none !important;
}

/* Style hover labels */
.chart-wrapper :deep(.hoverlayer .hovertext) {
  border-radius: 0.375rem !important;
}

/* Improve grid lines */
.chart-wrapper :deep(.gridlayer .crisp) {
  opacity: 0.5 !important;
}

.error-message {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #ef4444;
  background: rgba(239, 68, 68, 0.1);
}
</style>

