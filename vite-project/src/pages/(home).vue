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
      <h1 class="text-2xl font-bold mb-4 text-xy-intelligence">
        <span class="xy-part">XY</span><span class="hyphen-part">-</span><span class="intelligence-part">Intelligence</span>
      </h1>
      <p class="text-[#475569]">Redirecting to chat...</p>
    </div>
  </div>
</template>