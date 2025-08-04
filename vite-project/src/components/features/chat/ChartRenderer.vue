<template>
  <div v-if="chartSvg" class="chart-container my-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
    <div class="chart-wrapper" v-html="chartSvg"></div>
    <!-- Debug info - remove in production -->
    <div class="text-xs text-gray-500 mt-2">
      Chart SVG length: {{ chartSvg?.length || 0 }} characters
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  chartSvg?: string
}

const props = defineProps<Props>()
</script>

<style scoped>
.chart-container {
  max-width: 100%;
  overflow-x: auto;
}

.chart-wrapper {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-wrapper :deep(svg) {
  max-width: 100%;
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
  fill: #374151;
}

.chart-wrapper :deep(.axis text) {
  font-size: 12px;
  fill: #6b7280;
}

.chart-wrapper :deep(.legend text) {
  font-size: 12px;
  fill: #374151;
}
</style>