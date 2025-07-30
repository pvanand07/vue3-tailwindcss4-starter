<template>
  <!-- Empty State - Building Codes Interface -->
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
    <!-- Main Icon -->
    <div class="bg-slate-800 rounded-xl w-16 h-16 mb-6 shadow-lg overflow-hidden">
      <img src="/src/assets/images/d-code.png" alt="D Code Logo" class="w-full h-full object-cover" />
    </div>
    
    <!-- Main Heading -->
    <h1 class="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800 mb-3 px-4">
      Ask questions about building codes and regulations.
    </h1>
    
    <!-- Subtitle -->
    <p class="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 max-w-2xl px-4">
      Get instant answers about NBC 2016, IS codes, and regional building regulations.
    </p>
    
    <!-- Form Grid -->
    <div class="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
      <!-- State / Region -->
      <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
        <h3 class="font-medium text-slate-800 mb-2 text-sm">State / Region</h3>
        <select 
          :model-value="selectedState" 
          @update:model-value="$emit('update:selectedState', $event)"
          class="w-full p-2 text-sm border border-slate-300 rounded-md bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          aria-label="Select state or region"
        >
          <option value="">Select location</option>
          <option value="karnataka">Karnataka</option>
          <option value="kerala">Kerala</option>
        </select>
      </div>
      
      <!-- Applicable Code -->
      <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
        <h3 class="font-medium text-slate-800 mb-2 text-sm">Applicable Code</h3>
        <select 
          :model-value="selectedCode" 
          @update:model-value="$emit('update:selectedCode', $event)"
          class="w-full p-2 text-sm border border-slate-300 rounded-md bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          aria-label="Choose building codes"
        >
          <option value="">Choose building codes</option>
          <option value="kmbr">KMBR (Kerala Municipal Building Rules)</option>
          <option value="kpbr">KPBR (Kerala Panchayat Building Rules)</option>
          <option value="kmmbl">KMMBL (Karnataka Municipal Building Rules)</option>
          <option value="crz">CRZ (Coastal Regulation Zone)</option>
        </select>
      </div>
      
      <!-- Project Type -->
      <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
        <h3 class="font-medium text-slate-800 mb-2 text-sm">Project Type</h3>
        <select 
          :model-value="selectedProjectType" 
          @update:model-value="$emit('update:selectedProjectType', $event)"
          class="w-full p-2 text-sm border border-slate-300 rounded-md bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          aria-label="Select project category"
        >
          <option value="">Select project category</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="industrial">Industrial</option>
          <option value="hazardous">Hazardous</option>
          <option value="assembly">Assembly</option>
        </select>
      </div>
      
      <!-- Site Type -->
      <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
        <h3 class="font-medium text-slate-800 mb-2 text-sm">Site Type</h3>
        <select 
          :model-value="selectedSiteType" 
          @update:model-value="$emit('update:selectedSiteType', $event)"
          class="w-full p-2 text-sm border border-slate-300 rounded-md bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          aria-label="Specify site characteristics"
        >
          <option value="">Specify site characteristics</option>
          <option value="urban">Urban</option>
          <option value="rural">Rural</option>
          <option value="coastal">Coastal</option>
          <option value="hilly">Hilly/Sloped</option>
          <option value="industrial">Industrial</option>
          <option value="green_belt">Green Belt</option>
        </select>
      </div>
    </div>
    
    <!-- Quick Start Button -->
    <button 
      @click="$emit('generate-quick-question')"
      class="mt-6 bg-slate-600 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium text-sm"
      aria-label="Generate sample question based on selections"
    >
      <Search class="w-4 h-4" />
      Generate Sample Question
    </button>
  </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'

interface Props {
  selectedState: string
  selectedCode: string
  selectedProjectType: string
  selectedSiteType: string
}

interface Emits {
  (e: 'update:selectedState', value: string): void
  (e: 'update:selectedCode', value: string): void
  (e: 'update:selectedProjectType', value: string): void
  (e: 'update:selectedSiteType', value: string): void
  (e: 'generate-quick-question'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>