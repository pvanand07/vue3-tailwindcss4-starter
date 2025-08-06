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

          <!-- Charts Section (only for unreferenced charts) -->
          <div v-if="message.charts && message.charts.length > 0 && !hasChartPlaceholders(message.content)" class="mb-4">
            <!-- Debug info - remove in production -->
            <div class="text-xs text-gray-500 mb-2">
              Found {{ message.charts.length }} chart(s) in message (displaying after content)
            </div>
            <div v-for="(chartSvg, chartIndex) in message.charts" :key="chartIndex">
              <ChartRenderer :chart-svg="chartSvg" />
            </div>
          </div>

          <!-- Bot Response Content -->
          <div class="text-slate-700 max-w-full w-full">
            <MarkdownRenderer :content="message.content" :charts="message.charts" :chart-offset="chartOffset" />
            
            <!-- Unreferenced Charts Section (for mixed scenarios) -->
            <div v-if="message.charts && message.charts.length > 0 && hasChartPlaceholders(message.content) && getUnreferencedCharts(message.content, message.charts).length > 0" class="mt-4">
              <div class="text-xs text-gray-500 mb-2">
                Additional charts:
              </div>
              <div v-for="(chartSvg, chartIndex) in getUnreferencedCharts(message.content, message.charts)" :key="`unreferenced-${chartIndex}`">
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
import { ThumbsUp, ThumbsDown, Copy, Share2, Square } from 'lucide-vue-next'
import MarkdownRenderer from './MarkdownRenderer.vue'
import ChartRenderer from './ChartRenderer.vue'
import type { ChatMessage } from '../../../types/chat'

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

// Function to detect if content contains chart placeholders
const hasChartPlaceholders = (content: string): boolean => {
  const chartRegex = /<chart\s+id\s*=\s*\d+\s*>/gi
  return chartRegex.test(content)
}

// Function to get chart IDs referenced in content
const getReferencedChartIds = (content: string): number[] => {
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

// Function to get unreferenced charts (for after-message display)
const getUnreferencedCharts = (content: string, charts: string[]): string[] => {
  if (!charts || charts.length === 0) return []
  
  const referencedIds = getReferencedChartIds(content)
  const unreferencedCharts: string[] = []
  
  charts.forEach((chart, index) => {
    const globalChartId = props.chartOffset + index + 1 // Calculate global chart ID
    if (!referencedIds.includes(globalChartId)) {
      unreferencedCharts.push(chart)
    }
  })
  
  return unreferencedCharts
}

const toggleThinking = () => {
  emit('toggle-thinking', props.messageIndex)
}

const copyMessage = async () => {
  emit('copy-message', props.message.content)
}
</script>