<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center p-4">
    <div class="max-w-4xl mx-auto text-center">
      <div class="flex justify-center items-center gap-8 mb-8">
        <a href="https://vite.dev" target="_blank" class="group">
          <img src="/vite.svg" class="h-24 w-24 p-6 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg" alt="Vite logo" />
        </a>
        <a href="https://vuejs.org/" target="_blank" class="group">
          <img src="./assets/vue.svg" class="h-24 w-24 p-6 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg" alt="Vite logo" />
        </a>
      </div>
      <HelloWorld msg="Vite + Vue + Tailwind CSS v4.0" />
    </div>
  </div>
</template>
