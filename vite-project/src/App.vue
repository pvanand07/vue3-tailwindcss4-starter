<script setup lang="ts">
import { ref } from 'vue'

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <div 
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-900">Vue Chat</h1>
        <button 
          @click="toggleSidebar"
          class="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="mt-4">
        <RouterLink 
          to="/" 
          @click="sidebarOpen = false"
          class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          active-class="bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          </svg>
          Home
        </RouterLink>
        <RouterLink 
          to="/chat" 
          @click="sidebarOpen = false"
          class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          active-class="bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat
        </RouterLink>
        <RouterLink 
          to="/about" 
          @click="sidebarOpen = false"
          class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          active-class="bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          About
        </RouterLink>
      </nav>
    </div>

    <!-- Main Content -->
    <div 
      :class="[
        'min-h-screen transition-all duration-300 ease-in-out',
        sidebarOpen ? 'ml-64' : 'ml-0'
      ]"
    >
      <!-- Top Bar -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between px-4 py-3">
          <button 
            @click="toggleSidebar"
            class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="text-sm text-gray-500">
            {{ $route.name }}
          </div>
        </div>
      </div>

      <!-- Page Content -->
      <main class="p-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>
