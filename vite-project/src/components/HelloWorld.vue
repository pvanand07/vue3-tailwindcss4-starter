<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <h1 class="text-4xl font-bold text-gray-900 mb-8">{{ msg }}</h1>

  <div class="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-md mx-auto">
    <button 
      type="button" 
      @click="count++"
      class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-4"
    >
      count is {{ count }}
    </button>
    <p class="text-gray-600 text-sm">
      Edit
      <code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <div class="space-y-4 text-gray-700">
    <p>
      Check out
      <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank" class="text-indigo-600 hover:text-indigo-800 underline">create-vue</a>, the official Vue + Vite starter
    </p>
    <p>
      Learn more about IDE Support for Vue in the
      <a href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support" target="_blank" class="text-indigo-600 hover:text-indigo-800 underline">Vue Docs Scaling up Guide</a>.
    </p>
    <p class="text-gray-500 text-sm">Click on the Vite and Vue logos to learn more</p>
  </div>
</template>
