<template>
  <div v-if="chartSvg" ref="chartContainer" class="chart-container my-4 p-4 bg-[var(--color-surface)] rounded-lg shadow-sm border border-[var(--color-border)]">
    <div ref="chartWrapper" class="chart-wrapper"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'

interface Props {
  chartSvg?: string
}

const props = defineProps<Props>()

const chartWrapper = ref<HTMLElement | null>(null)

const renderChart = () => {
  if (props.chartSvg && chartWrapper.value) {
    const container = chartWrapper.value
    container.innerHTML = props.chartSvg

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
  }
}

onMounted(() => {
  renderChart()
})

watch(() => props.chartSvg, () => {
  nextTick(() => {
    renderChart()
  })
}, { immediate: true })

</script>

<style scoped>
.chart-container {
  max-width: 100%;
  max-width: 800px;
  max-height: 600px;
  overflow-x: auto;
}

.chart-wrapper {
  min-height: 300px;
  max-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.chart-wrapper :deep(svg) {
  max-width: 100%;
  max-width: 750px;
  max-height: 450px;
  height: auto;
  min-height: 300px;
}

/* Style the chart elements */
.chart-wrapper :deep(.pygal-chart) {
  font-family: 'Inter', sans-serif;
}

.chart-wrapper :deep(.title) {
  font-size: 16px;
  font-weight: 600;
  fill: var(--color-text-primary);
}

.chart-wrapper :deep(.axis text) {
  font-size: 12px;
  fill: var(--color-text-secondary);
}

.chart-wrapper :deep(.legend text) {
  font-size: 12px;
  fill: var(--color-text-primary);
}

/* Chart colors - Bar chart */
.chart-wrapper :deep(.bar) {
  fill: #2F5BFF;
}

.chart-wrapper :deep(.bar:hover) {
  fill: #1E40FF;
}

/* Chart colors - Donut chart */
.chart-wrapper :deep(.slice-0) {
  fill: #2F5BFF;
}

.chart-wrapper :deep(.slice-1) {
  fill: #A8B6FF;
}

.chart-wrapper :deep(.slice-2) {
  fill: #E4E9FF;
}
</style>
