<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.push('/chat')
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-[#EFF3F9]">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-[#0F172A] mb-4">XY-Intelligence</h1>
      <p class="text-[#475569]">Redirecting to chat...</p>
    </div>
  </div>
</template>