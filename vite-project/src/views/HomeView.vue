<script setup lang="ts">
// Minimalist home page
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Welcome to Vue Chat</h1>
      <p class="text-gray-600 mb-8">A simple chat application built with Vue 3, Tailwind CSS, and Vue Router.</p>
      
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Getting Started</h2>
        <p class="text-gray-600 text-sm mb-4">
          Use the sidebar to navigate between pages. Try the chat feature to see the application in action.
        </p>
        <RouterLink 
          to="/chat"
          class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Start Chatting
        </RouterLink>
      </div>
    </div>
  </div>
</template> 