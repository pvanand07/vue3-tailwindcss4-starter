<template>
  <div class="chart-container mb-4">
    <div v-if="error" class="chart-error bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <div class="font-medium mb-1">Chart Error</div>
      <div class="text-sm">{{ error }}</div>
    </div>
    <div v-else-if="loading"
      class="chart-loading bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-slate-600">
      <div class="animate-pulse">Loading chart...</div>
    </div>
    <div v-else class="chart-wrapper bg-white border border-slate-200 rounded-lg p-4">
      <canvas :ref="(el) => canvasRef = el as HTMLCanvasElement" class="max-w-full"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  LogarithmicScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  BubbleController,
  ScatterController,
  RadarController,
  PolarAreaController,
  ChartConfiguration
} from 'chart.js'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  LogarithmicScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  BubbleController,
  ScatterController,
  RadarController,
  PolarAreaController
)

interface Props {
  config: string | ChartConfiguration
  height?: number
  width?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  width: 600
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const chartInstance = ref<Chart | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const parseConfig = (configInput: string | ChartConfiguration): ChartConfiguration | null => {
  try {
    if (typeof configInput === 'object') {
      return configInput
    }

    // Parse the configuration string
    let configStr = configInput.trim()

    // Remove 'config = ' prefix if present
    if (configStr.startsWith('config = ')) {
      configStr = configStr.substring('config = '.length)
    }

    // Use Function constructor for safer evaluation
    const configFunction = new Function('return ' + configStr)
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

const createChart = () => {
  if (!canvasRef.value) return

  loading.value = true
  error.value = null

  try {
    const parsedConfig = parseConfig(props.config)

    if (!parsedConfig) {
      throw new Error('Invalid chart configuration')
    }

    // Ensure responsive options
    const config: ChartConfiguration = {
      ...parsedConfig,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...parsedConfig.options
      }
    }

    // Destroy existing chart if it exists
    if (chartInstance.value) {
      chartInstance.value.destroy()
    }

    // Create new chart
    chartInstance.value = new Chart(canvasRef.value, config)
    loading.value = false
  } catch (err) {
    console.error('Failed to create chart:', err)
    error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    loading.value = false
  }
}

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
})

// Watch for config changes
watch(() => props.config, () => {
  createChart()
}, { deep: true })
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
}

.chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.chart-wrapper canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
}

.chart-error {
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chart-loading {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>