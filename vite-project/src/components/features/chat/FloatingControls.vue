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
  
  <div class="fixed top-2 right-2 z-50 flex gap-2">
    <button 
      @click="$emit('toggle-create-mode')"
      :class="[
        'backdrop-blur-lg border rounded-lg p-3 shadow-lg transition-colors',
        createMode 
          ? 'bg-blue-500 border-blue-600 hover:bg-blue-600' 
          : 'bg-white/80 border-slate-200 hover:bg-white/90'
      ]"
      :aria-label="createMode ? 'Switch to Chat mode' : 'Switch to Create mode'"
      :title="createMode ? 'Chat Mode' : 'Create Mode'"
    >
      <Sparkles :class="createMode ? 'w-5 h-4 text-white' : 'w-5 h-4 text-slate-700'" />
    </button>
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
      :value="selectedModel" 
      @change="handleModelChange"
      class="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 shadow-lg hover:bg-white/90 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
      aria-label="Select AI Model"
    >
    <option value="openrouter/auto">Elevatics Auto</option>
                  <option value="openai/gpt-4.1">GPT-4.1-Mini</option>
                  <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="z-ai/glm-4.5">GLM 4.5</option>
                  <option value="openai/gpt-oss-120b">GPT-OSS 120B</option>
                  <option value="x-ai/grok-code-fast-1">Grok Code Fast 1</option>
                  <option value="anthropic/claude-sonnet-4">Sonnet 4</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { PanelLeftOpen, SquarePen, Sparkles } from 'lucide-vue-next'

interface Props {
  sidebarOpen: boolean
  selectedModel: string
  createMode: boolean
}

interface Emits {
  (e: 'toggle-sidebar'): void
  (e: 'start-new-chat'): void
  (e: 'update:selectedModel', value: string): void
  (e: 'toggle-create-mode'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleModelChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newModel = target.value
  console.log('🎯 FloatingControls: Model changed to:', newModel)
  emit('update:selectedModel', newModel)
}
</script>