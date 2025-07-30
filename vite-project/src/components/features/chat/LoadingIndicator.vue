<template>
  <div v-if="isVisible" class="flex gap-3 mb-6" role="status" aria-label="AI is typing">
    <div class="flex-1">
      <div class="text-slate-700 flex items-center gap-2">
        <span class="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
        <span class="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style="animation-delay: 150ms;"></span>
        <span class="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style="animation-delay: 300ms;"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
}

defineProps<Props>()
</script>