<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.push('/chat')
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-slate-700 mb-4">IResearcher</h1>
      <p class="text-slate-600">Redirecting to chat...</p>
    </div>
  </div>
</template>