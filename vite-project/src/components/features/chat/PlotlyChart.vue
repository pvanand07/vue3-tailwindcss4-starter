<template>
  <div class="plotly-chart-container">
    <div v-if="error" class="error-message">
      <span class="text-red-500">⚠️ Failed to render visualization: {{ error }}</span>
    </div>
    <div v-else ref="chartContainer" class="chart-wrapper"></div>
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

    // Extract data, layout, and config from the figure
    const data = figData.data
    const layout = {
      ...figData.layout,
      autosize: true,
      margin: { t: 40, r: 20, b: 40, l: 60 },
      paper_bgcolor: 'var(--color-surface)',
      plot_bgcolor: 'var(--color-surface)',
      font: {
        color: 'var(--color-text-primary)',
        family: 'system-ui, -apple-system, sans-serif'
      },
      xaxis: {
        ...figData.layout?.xaxis,
        gridcolor: 'var(--color-border)',
        linecolor: 'var(--color-border)',
        zerolinecolor: 'var(--color-border)'
      },
      yaxis: {
        ...figData.layout?.yaxis,
        gridcolor: 'var(--color-border)',
        linecolor: 'var(--color-border)',
        zerolinecolor: 'var(--color-border)'
      }
    }
    const config = {
      ...figData.config,
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d']
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

.chart-wrapper {
  width: 100%;
  min-height: 400px;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  overflow: hidden;
}

.error-message {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #ef4444;
  background: rgba(239, 68, 68, 0.1);
}
</style>

