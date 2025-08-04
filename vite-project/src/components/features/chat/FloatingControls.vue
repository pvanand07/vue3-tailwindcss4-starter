<template>
  <!-- Floating Icons -->
  <div class="fixed top-2 left-2 z-50">
    <button 
      @click="$emit('toggle-sidebar')"
      class="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-lg p-3 shadow-lg hover:bg-white/90 transition-colors"
      :aria-label="sidebarOpen ? 'Close sidebar' : 'Open sidebar'"
    >
      <PanelLeftOpen class="w-5 h-4 text-slate-700" />
    </button>
  </div>
  
  <div class="fixed top-2 right-2 z-50">
    <button 
      @click="$emit('start-new-chat')"
      class="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-lg p-3 shadow-lg hover:bg-white/90 transition-colors"
      aria-label="Start new chat"
    >
      <SquarePen class="w-5 h-4 text-slate-700" />
    </button>
  </div>

  <!-- Model Selector for Small Screens - Top Center -->
  <div class="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 sm:hidden">
    <select 
      :model-value="selectedModel" 
      @update:model-value="$emit('update:selectedModel', $event)"
      class="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 shadow-lg hover:bg-white/90 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
      aria-label="Select AI Model"
    >
      <option value="openai/gpt-4.1-mini">GPT-4.1 Mini</option>
      <option value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
      <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
      <option value="qwen/qwen3-coder:floor">Qwen3 Coder</option>
      <option value="z-ai/glm-4.5">GLM 4.5</option>
      <option value="">Grok 3 Mini</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { PanelLeftOpen, SquarePen } from 'lucide-vue-next'

interface Props {
  sidebarOpen: boolean
  selectedModel: string
}

interface Emits {
  (e: 'toggle-sidebar'): void
  (e: 'start-new-chat'): void
  (e: 'update:selectedModel', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>