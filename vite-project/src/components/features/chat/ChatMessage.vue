<template>
  <div class="w-full">
    <!-- AI Message -->
    <div v-if="message.role === 'assistant'" class="flex gap-3 mb-6">
      <div class="flex-1 max-w-full">
        <div class="max-w-full w-full">
          <!-- Thinking Section -->
          <div v-if="message.tools && message.tools.length > 0" class="bg-slate-50 border border-slate-200 rounded-lg mb-4 overflow-hidden">
            <div 
              class="bg-slate-100 p-3 cursor-pointer flex items-center justify-between font-medium text-slate-600 hover:bg-slate-200 transition-colors duration-200 select-none"
              @click="toggleThinking"
              role="button"
              :aria-expanded="message.thinkingExpanded"
              aria-controls="thinking-content"
            >
              <span>🤔 Thinking...</span>
              <span class="text-xs transition-transform duration-200" :class="{ 'rotate-180': message.thinkingExpanded }">▼</span>
            </div>
            <div 
              id="thinking-content"
              class="transition-all duration-300 overflow-hidden" 
              :class="message.thinkingExpanded ? 'max-h-96 p-4' : 'max-h-0 p-0'"
            >
              <div class="max-h-96 overflow-y-auto scrollbar-thin">
                <div v-for="(tool, toolIndex) in message.tools" :key="toolIndex" class="mb-3 p-3 bg-white rounded-md border-l-4 border-primary">
                  <div class="font-semibold text-primary text-sm mb-2">🔧 {{ tool.name }}</div>
                  <div class="bg-slate-50 p-2 rounded text-xs font-mono text-primary mb-2 break-all">{{ tool.input }}</div>
                  <div v-if="tool.reasoning" class="text-slate-600 italic text-xs leading-relaxed">💭 {{ tool.reasoning }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bot Response Content - Rendered as Segments -->
          <div class="text-slate-700 max-w-full w-full">
            <!-- Render content segments (markdown + inline charts) -->
            <template v-for="(segment, segmentIndex) in contentSegments" :key="`segment-${segmentIndex}`">
              <MarkdownRenderer 
                v-if="segment.type === 'markdown'" 
                :content="segment.content || ''" 
              />
              <ChartRenderer 
                v-else-if="segment.type === 'chart' && getChartForId(segment.chartId!)" 
                :chart-svg="getChartForId(segment.chartId!)!" 
              />
              <div 
                v-else-if="segment.type === 'chart'"
                class="chart-error my-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center"
              >
                <p class="text-sm">⚠️ Chart {{ segment.chartId }} not found</p>
              </div>
            </template>
            
            <!-- Unreferenced Charts Section (for after-message display) -->
            <div v-if="unreferencedCharts.length > 0" class="mt-4">
              <div class="text-xs text-gray-500 mb-2">
                Additional charts:
              </div>
              <div v-for="(chartSvg, chartIndex) in unreferencedCharts" :key="`unreferenced-${chartIndex}`">
                <ChartRenderer :chart-svg="chartSvg" />
              </div>
            </div>
            
            <!-- Stop Streaming Button -->
            <div v-if="message.isLoading" class="mt-3">
              <button 
                @click="$emit('cancel-request')" 
                class="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md px-3 py-1.5 transition-colors"
                aria-label="Stop generating response"
              >
                <Square class="w-4 h-4" />
                <span>Stop</span>
              </button>
            </div>

            <!-- Bot actions -->
            <div class="flex items-center gap-4 mt-3 text-slate-400">
               <button @click="copyMessage" class="hover:text-slate-600 transition-colors" aria-label="Like response">
                   <ThumbsUp class="w-4 h-4" />
               </button>
               <button class="hover:text-slate-600 transition-colors" aria-label="Dislike response">
                   <ThumbsDown class="w-4 h-4" />
               </button>
               <button @click="copyMessage" class="hover:text-slate-600 transition-colors" aria-label="Copy message">
                   <Copy class="w-4 h-4" />
               </button>
               <button class="hover:text-slate-600 transition-colors" aria-label="Share message">
                   <Share2 class="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- User Message -->
    <div v-else-if="message.role === 'user'" class="flex justify-end mb-6">
      <div class="max-w-2xl">
        <div class="bg-primary text-white p-4 rounded-xl rounded-br-none">
          <p class="text-sm md:text-base leading-relaxed">{{ message.content }}</p>
        </div>
      </div>
    </div>

    <!-- System Message -->
    <div v-else-if="message.role === 'system'" class="flex justify-center mb-6">
      <div class="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm" role="status">
        {{ message.content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ThumbsUp, ThumbsDown, Copy, Share2, Square } from 'lucide-vue-next'
import MarkdownRenderer from './MarkdownRenderer.vue'
import ChartRenderer from './ChartRenderer.vue'
import type { ChatMessage } from '../../../types/chat'
import { parseMessageContent, getUnreferencedCharts, type ContentSegment } from '../../../utils/contentParser'

interface Props {
  message: ChatMessage
  messageIndex: number
  chartOffset: number
}

interface Emits {
  (e: 'toggle-thinking', index: number): void
  (e: 'copy-message', text: string): void
  (e: 'cancel-request'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Parse message content into segments for rendering
const contentSegments = computed((): ContentSegment[] => {
  return parseMessageContent(props.message.content)
})

// Get chart SVG by global chart ID (with offset calculation)
const getChartForId = (globalChartId: number): string | null => {
  if (!props.message.charts || props.message.charts.length === 0) {
    return null
  }
  
  const localChartIndex = globalChartId - props.chartOffset - 1
  
  if (localChartIndex >= 0 && localChartIndex < props.message.charts.length) {
    return props.message.charts[localChartIndex]
  }
  
  return null
}

// Get unreferenced charts for after-message display
const unreferencedCharts = computed((): string[] => {
  if (!props.message.charts || props.message.charts.length === 0) {
    return []
  }
  
  return getUnreferencedCharts(props.message.content, props.message.charts, props.chartOffset)
})

const toggleThinking = () => {
  emit('toggle-thinking', props.messageIndex)
}

const copyMessage = async () => {
  emit('copy-message', props.message.content)
}
</script>