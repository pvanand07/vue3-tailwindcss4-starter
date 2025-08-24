<template>
  <!-- Empty State - Building Codes Interface -->
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
    <!-- Main Icon -->
    <div class="bg-slate-800 rounded-xl w-16 h-16 mb-2 shadow-lg overflow-hidden">
      <img src="/src/assets/images/d-code.png" alt="D Code Logo" class="w-full h-full object-cover" />
    </div>
    
  <!-- Brand Name -->
  <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-slate-700 mb-6">D code</h1>
    
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
         <h3 class="font-medium text-slate-800 mb-3 text-sm">State / Region</h3>
         <div class="space-y-2">
           <label class="flex items-center space-x-2 cursor-pointer">
             <input
               type="checkbox"
               value="karnataka"
               :checked="selectedStates.includes('karnataka')"
               @change="toggleState('karnataka')"
               class="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500 focus:ring-2"
             />
             <span class="text-sm text-slate-700">Karnataka</span>
           </label>
           <label class="flex items-center space-x-2 cursor-pointer">
             <input
               type="checkbox"
               value="kerala"
               :checked="selectedStates.includes('kerala')"
               @change="toggleState('kerala')"
               class="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500 focus:ring-2"
             />
             <span class="text-sm text-slate-700">Kerala</span>
           </label>
         </div>
       </div>
       
       <!-- Applicable Code -->
       <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
         <h3 class="font-medium text-slate-800 mb-3 text-sm">Applicable Code</h3>
         <div class="space-y-2">
           <label class="flex items-center space-x-2 cursor-pointer group relative">
             <input
               type="checkbox"
               value="kmbr"
               :checked="selectedCodes.includes('kmbr')"
               @change="toggleCode('kmbr')"
               class="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500 focus:ring-2"
             />
             <span class="text-sm text-slate-700">KMBR</span>
             <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
               KERALA MUNICIPALITY BUILDING RULES, 2019 (amended upto SRO 100/2023)
               <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
             </div>
           </label>
           <label class="flex items-center space-x-2 cursor-pointer group relative">
             <input
               type="checkbox"
               value="kpbr"
               :checked="selectedCodes.includes('kpbr')"
               @change="toggleCode('kpbr')"
               class="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500 focus:ring-2"
             />
             <span class="text-sm text-slate-700">KPBR</span>
             <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
               KERALA PANCHAYAT BUILDING RULES, 2019 (amended upto SRO 101/2023)
               <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
             </div>
           </label>
           <label class="flex items-center space-x-2 cursor-pointer group relative">
             <input
               type="checkbox"
               value="kmmbl"
               :checked="selectedCodes.includes('kmmbl')"
               @change="toggleCode('kmmbl')"
               class="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500 focus:ring-2"
             />
             <span class="text-sm text-slate-700">KMMBL</span>
             <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
               Karnataka Municipalities Model Building Bye-Laws 2017 (Draft)
               <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
             </div>
           </label>
           <label class="flex items-center space-x-2 cursor-pointer group relative">
             <input
               type="checkbox"
               value="crz"
               :checked="selectedCodes.includes('crz')"
               @change="toggleCode('crz')"
               class="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500 focus:ring-2"
             />
             <span class="text-sm text-slate-700">CRZ</span>
             <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
               COASTAL REGULATION ZONE NOTIFICATION, 2019 WITH AMENDMENTS (Upto 24.11.2022)
               <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
             </div>
           </label>
           <label class="flex items-center space-x-2 cursor-pointer group relative">
             <input
               type="checkbox"
               value="bbmp"
               :checked="selectedCodes.includes('bbmp')"
               @change="toggleCode('bbmp')"
               class="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500 focus:ring-2"
             />
             <span class="text-sm text-slate-700">BBMP</span>
             <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
               Bangalore Mahanagara Palike Building Bye-Laws 2003
               <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
             </div>
           </label>
         </div>
       </div>
      
      <!-- Project Type -->
      <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
        <h3 class="font-medium text-slate-800 mb-2 text-sm">Project Type</h3>
        <select 
          :value="selectedProjectType" 
          @change="$emit('update:selected-project-type', ($event.target as HTMLSelectElement).value)"
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
          :value="selectedSiteType" 
          @change="$emit('update:selected-site-type', ($event.target as HTMLSelectElement).value)"
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
      class="mt-6 bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium text-sm"
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
  selectedStates: string[]
  selectedCodes: string[]
  selectedProjectType: string
  selectedSiteType: string
}

interface Emits {
  (e: 'update:selected-states', value: string[]): void
  (e: 'update:selected-codes', value: string[]): void
  (e: 'update:selected-project-type', value: string): void
  (e: 'update:selected-site-type', value: string): void
  (e: 'generate-quick-question'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toggleState = (state: string) => {
  const newStates = props.selectedStates.includes(state)
    ? props.selectedStates.filter(s => s !== state)
    : [...props.selectedStates, state]
  emit('update:selected-states', newStates)
}

const toggleCode = (code: string) => {
  const newCodes = props.selectedCodes.includes(code)
    ? props.selectedCodes.filter(c => c !== code)
    : [...props.selectedCodes, code]
  emit('update:selected-codes', newCodes)
}
</script>