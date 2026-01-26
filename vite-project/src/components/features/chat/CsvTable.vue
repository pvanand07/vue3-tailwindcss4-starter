<template>
  <div class="csv-table-container my-4">
    <!-- Error State -->
    <div v-if="error" class="error-message bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg" role="alert">
      <span class="font-medium">⚠️ Failed to render CSV:</span>
      <span class="ml-2">{{ error }}</span>
    </div>

    <!-- Single Row: Render as KPI Cards -->
    <div v-else-if="isSingleRow && !isExpanded" class="kpi-cards-container">
      <!-- Header with Download -->
      <div class="flex items-center justify-between mb-3">
        <div class="text-sm font-medium text-[var(--color-text-secondary)]">
          {{ title || 'Summary Metrics' }}
        </div>
        <button
          @click="downloadCsv"
          class="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-blue)] hover:bg-[var(--color-surface)] rounded-md transition-colors border border-[var(--color-border)]"
          title="Download CSV"
          aria-label="Download CSV file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Download</span>
        </button>
      </div>
      
       <!-- KPI Cards Grid -->
       <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
         <div
           v-for="(header, index) in headers"
           :key="index"
           class="kpi-card backdrop-blur-sm border rounded-xl p-4 transition-all hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5"
           :class="getKpiColorClass(header)"
         >
           <div class="flex items-start justify-between">
             <div class="flex-1 min-w-0">
               <div class="text-xs font-medium uppercase tracking-wider mb-2 opacity-80">
                 {{ formatHeaderLabel(header) }}
               </div>
               <div class="text-xl font-bold text-[var(--color-text-primary)] break-words leading-tight">
                 {{ formatValue(header, rows[0][index]) }}
               </div>
             </div>
             <div class="ml-3 flex-shrink-0 opacity-90">
               <div class="p-2 rounded-lg transition-transform hover:scale-110" :class="getKpiIconBgClass(header)">
                 <component 
                   :is="getKpiIcon(header)" 
                   :size="20" 
                   :stroke-width="2.5"
                   :class="getKpiIconColor(header)"
                 />
               </div>
             </div>
           </div>
         </div>
       </div>
      
      <!-- View as Table Link -->
      <button
        @click="toggleExpand"
        class="mt-3 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary-blue)] flex items-center gap-1 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span>View as table</span>
      </button>
    </div>

    <!-- Multiple Rows: Collapsed State - Button to expand table -->
    <div v-else-if="!isExpanded" class="csv-button-container">
      <div class="csv-expand-button flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] hover:bg-[var(--color-icon-bg)] border border-[var(--color-border)] rounded-lg transition-colors group">
        <!-- Sheets Icon -->
        <div class="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600 dark:text-green-400">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </div>
        
        <!-- Info - Clickable to expand -->
        <div 
          @click="toggleExpand"
          class="flex-1 cursor-pointer"
          role="button"
          tabindex="0"
          @keydown.enter="toggleExpand"
          @keydown.space.prevent="toggleExpand"
          aria-label="View CSV table"
        >
          <div class="text-sm font-medium text-[var(--color-text-primary)]">
            {{ title || 'CSV Data Table' }}
          </div>
          <div class="text-xs text-[var(--color-text-secondary)]">
            {{ rowCount }} {{ rowCount === 1 ? 'row' : 'rows' }} • {{ headers.length }} {{ headers.length === 1 ? 'column' : 'columns' }}
          </div>
        </div>
        
        <!-- Download button -->
        <button
          @click="downloadCsv"
          class="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-blue)] hover:bg-[var(--color-surface)] rounded-md transition-colors"
          title="Download CSV"
          aria-label="Download CSV file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Download</span>
        </button>
        
        <!-- Expand indicator - Clickable -->
        <div 
          @click="toggleExpand"
          class="flex-shrink-0 text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary-blue)] transition-colors cursor-pointer"
          role="button"
          tabindex="0"
          @keydown.enter="toggleExpand"
          @keydown.space.prevent="toggleExpand"
          aria-label="Expand table"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </div>

    <!-- Expanded State: Full Table -->
    <div v-else class="table-card bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      <!-- Table Header with Controls - Clickable to collapse -->
      <div 
        class="table-header flex items-center justify-between px-4 py-3 bg-[var(--color-icon-bg)] border-b border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-surface)] transition-colors group"
        @click="toggleExpand"
        role="button"
        tabindex="0"
        @keydown.enter="toggleExpand"
        @keydown.space.prevent="toggleExpand"
        :aria-label="isSingleRow ? 'Back to summary metrics' : 'Collapse table'"
      >
        <div class="flex items-center gap-2 flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600 dark:text-green-400 flex-shrink-0">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span class="text-sm font-medium text-[var(--color-text-secondary)]">
            {{ title || (isSingleRow ? 'Summary Metrics (Table View)' : `CSV Data (${rowCount} ${rowCount === 1 ? 'row' : 'rows'})`) }}
          </span>
          
          <!-- Collapse indicator -->
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary-blue)] transition-colors ml-2">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </div>
        
        <div class="flex items-center gap-2" @click.stop>
          <!-- Download button -->
          <button 
            @click="downloadCsv" 
            class="download-button flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-blue)] hover:bg-[var(--color-icon-bg)] rounded-md transition-colors"
            title="Download CSV"
            aria-label="Download CSV file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download</span>
          </button>
        </div>
      </div>

      <!-- Table Wrapper with Scroll -->
      <div class="table-wrapper overflow-x-auto max-h-[600px] overflow-y-auto">
        <table class="csv-table w-full">
          <thead class="sticky top-0 bg-[var(--color-icon-bg)] z-10">
            <tr>
              <th 
                v-for="(header, index) in headers" 
                :key="index"
                class="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider border-b border-[var(--color-border)] whitespace-nowrap"
              >
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
            <tr 
              v-for="(row, rowIndex) in rows" 
              :key="rowIndex"
              class="hover:bg-[var(--color-icon-bg)] transition-colors"
            >
              <td 
                v-for="(cell, cellIndex) in row" 
                :key="cellIndex"
                class="px-4 py-3 text-sm text-[var(--color-text-primary)] whitespace-nowrap"
              >
                {{ cell }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Calendar, 
  DollarSign, 
  Weight, 
  Receipt, 
  Database, 
  Users, 
  List, 
  Tag, 
  TrendingUp,
  Info,
  Package,
  Gift,
  Percent,
  Store,
  FileSpreadsheet,
  Hash
} from 'lucide-vue-next'

interface Props {
  csvData: string
  title?: string
}

const props = defineProps<Props>()
const headers = ref<string[]>([])
const rows = ref<string[][]>([])
const error = ref<string>('')
const isExpanded = ref<boolean>(false)

const rowCount = computed(() => rows.value.length)
const isSingleRow = computed(() => rows.value.length === 1)

/**
 * Toggle table expand/collapse
 */
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

/**
 * Format large numbers with abbreviations (K, L, Cr)
 */
const formatLargeNumber = (num: number): string => {
  const absNum = Math.abs(num)
  
  // Crores (10 million)
  if (absNum >= 10000000) {
    return (num / 10000000).toFixed(2) + ' Cr'
  }
  // Lakhs (100 thousand)
  if (absNum >= 100000) {
    return (num / 100000).toFixed(2) + ' L'
  }
  // Thousands
  if (absNum >= 1000) {
    return (num / 1000).toFixed(2) + ' K'
  }
  
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num)
}

/**
 * Format currency with proper Indian numbering
 */
const formatCurrency = (num: number): string => {
  const absNum = Math.abs(num)
  
  // For very large amounts, show abbreviated
  if (absNum >= 10000000) {
    const crores = num / 10000000
    return `₹${crores.toFixed(2)} Cr`
  }
  if (absNum >= 100000) {
    const lakhs = num / 100000
    return `₹${lakhs.toFixed(2)} L`
  }
  
  // For smaller amounts, show full value
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

/**
 * Format value based on header name
 */
const formatValue = (header: string, value: string): string => {
  const lowerHeader = header.toLowerCase()
  const numValue = parseFloat(value)
  
  // Date formatting - full date display
  if (lowerHeader.includes('date')) {
    // Try parsing as date
    const dateValue = new Date(value)
    if (!isNaN(dateValue.getTime())) {
      return new Intl.DateTimeFormat('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(dateValue)
    }
  }
  
  // Currency formatting for sales, amount, value
  if ((lowerHeader.includes('sales') || lowerHeader.includes('amount') || 
       lowerHeader.includes('value') || lowerHeader.includes('discount')) && 
      !isNaN(numValue)) {
    return formatCurrency(numValue)
  }
  
  // Number formatting for large numbers (kg, rows, etc.)
  if (!isNaN(numValue)) {
    // For decimal numbers with many places (like kg with precision)
    if (numValue % 1 !== 0 && value.includes('.')) {
      const decimalPlaces = value.split('.')[1]?.length || 0
      // If too many decimal places, round to 2
      if (decimalPlaces > 2) {
        return formatLargeNumber(Math.round(numValue * 100) / 100)
      }
    }
    
    // For whole numbers or simple decimals
    return formatLargeNumber(numValue)
  }
  
  return value
}

/**
 * Get Lucide icon component for KPI based on header name
 */
const getKpiIcon = (header: string) => {
  const lowerHeader = header.toLowerCase()
  
  // Date fields
  if (lowerHeader.includes('date')) return Calendar
  
  // Currency/Sales fields
  if (lowerHeader.includes('sales') || lowerHeader.includes('amount') || 
      lowerHeader.includes('value')) return DollarSign
  
  // Discount fields
  if (lowerHeader.includes('disc')) {
    // Check if it's a percentage discount
    if (lowerHeader.includes('%') || lowerHeader.includes('percent')) return Percent
    return Tag
  }
  
  // Weight/Measurement fields
  if (lowerHeader.includes('kg') || lowerHeader.includes('weight')) return Weight
  
  // Quantity/Units fields
  if (lowerHeader.includes('qty') || lowerHeader.includes('unit') || 
      lowerHeader.includes('quantity')) {
    // Free units get gift icon
    if (lowerHeader.includes('free')) return Gift
    return Package
  }
  if (lowerHeader.includes('free')) return Gift
  
  // Transaction fields
  if (lowerHeader.includes('bill') || lowerHeader.includes('invoice')) return Receipt
  
  // Customer/Party fields
  if (lowerHeader.includes('part') || lowerHeader.includes('customer') || 
      lowerHeader.includes('client')) return Users
  
  // Location/Store fields
  if (lowerHeader.includes('outlet') || lowerHeader.includes('store') || 
      lowerHeader.includes('shop')) return Store
  
  // Count/Row fields
  if (lowerHeader.includes('row') || lowerHeader.includes('count')) return Database
  
  // Line items
  if (lowerHeader.includes('line')) return List
  
  // ID/Code fields
  if (lowerHeader.includes('code') || lowerHeader.includes('id') || 
      lowerHeader.includes('no') || lowerHeader.includes('sr')) return Hash
  
  // Table/File fields
  if (lowerHeader.includes('table') || lowerHeader.includes('file') || 
      lowerHeader.includes('source')) return FileSpreadsheet
  
  // Average/Trend fields
  if (lowerHeader.includes('avg') || lowerHeader.includes('average') || 
      lowerHeader.includes('mean')) return TrendingUp
  
  return Info
}

/**
 * Get icon color class for KPI based on header name
 */
const getKpiIconColor = (header: string): string => {
  const lowerHeader = header.toLowerCase()
  
  // Green for sales/money
  if (lowerHeader.includes('sales') || lowerHeader.includes('amount') || 
      lowerHeader.includes('value')) 
    return 'text-green-600 dark:text-green-400'
  
  // Blue for quantities/weight
  if (lowerHeader.includes('kg') || lowerHeader.includes('weight') || 
      lowerHeader.includes('qty') || lowerHeader.includes('unit'))
    return 'text-blue-600 dark:text-blue-400'
  
  // Purple for transactions
  if (lowerHeader.includes('bill') || lowerHeader.includes('invoice')) 
    return 'text-purple-600 dark:text-purple-400'
  
  // Orange for discounts
  if (lowerHeader.includes('disc'))
    return 'text-orange-600 dark:text-orange-400'
  
  // Indigo for averages/trends
  if (lowerHeader.includes('avg') || lowerHeader.includes('average')) 
    return 'text-indigo-600 dark:text-indigo-400'
  
  // Pink for free items/gifts
  if (lowerHeader.includes('free'))
    return 'text-pink-600 dark:text-pink-400'
  
  // Cyan for locations/stores
  if (lowerHeader.includes('outlet') || lowerHeader.includes('store'))
    return 'text-cyan-600 dark:text-cyan-400'
  
  // Teal for customers/parties
  if (lowerHeader.includes('part') || lowerHeader.includes('customer'))
    return 'text-teal-600 dark:text-teal-400'
  
  // Gray for dates and other fields
  if (lowerHeader.includes('date'))
    return 'text-gray-600 dark:text-gray-400'
  
  return 'text-gray-500 dark:text-gray-400'
}

/**
 * Get color class for KPI based on header name
 */
const getKpiColorClass = (header: string): string => {
  const lowerHeader = header.toLowerCase()
  
  if (lowerHeader.includes('sales') || lowerHeader.includes('amount')) 
    return 'bg-green-50/50 dark:bg-green-900/10 border-green-200/60 dark:border-green-800/40'
  if (lowerHeader.includes('kg') || lowerHeader.includes('weight')) 
    return 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/60 dark:border-blue-800/40'
  if (lowerHeader.includes('bill') || lowerHeader.includes('invoice')) 
    return 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200/60 dark:border-purple-800/40'
  if (lowerHeader.includes('discount')) 
    return 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-200/60 dark:border-orange-800/40'
  if (lowerHeader.includes('avg') || lowerHeader.includes('average')) 
    return 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200/60 dark:border-indigo-800/40'
  
  return 'bg-gray-50/50 dark:bg-gray-900/10 border-gray-200/60 dark:border-gray-800/40'
}

/**
 * Get icon background class for KPI based on header name
 */
const getKpiIconBgClass = (header: string): string => {
  const lowerHeader = header.toLowerCase()
  
  if (lowerHeader.includes('sales') || lowerHeader.includes('amount') || 
      lowerHeader.includes('value')) 
    return 'bg-green-100/70 dark:bg-green-900/30'
  
  if (lowerHeader.includes('kg') || lowerHeader.includes('weight') || 
      lowerHeader.includes('qty') || lowerHeader.includes('unit'))
    return 'bg-blue-100/70 dark:bg-blue-900/30'
  
  if (lowerHeader.includes('bill') || lowerHeader.includes('invoice')) 
    return 'bg-purple-100/70 dark:bg-purple-900/30'
  
  if (lowerHeader.includes('disc'))
    return 'bg-orange-100/70 dark:bg-orange-900/30'
  
  if (lowerHeader.includes('avg') || lowerHeader.includes('average')) 
    return 'bg-indigo-100/70 dark:bg-indigo-900/30'
  
  if (lowerHeader.includes('free'))
    return 'bg-pink-100/70 dark:bg-pink-900/30'
  
  if (lowerHeader.includes('outlet') || lowerHeader.includes('store'))
    return 'bg-cyan-100/70 dark:bg-cyan-900/30'
  
  if (lowerHeader.includes('part') || lowerHeader.includes('customer'))
    return 'bg-teal-100/70 dark:bg-teal-900/30'
  
  if (lowerHeader.includes('date'))
    return 'bg-gray-100/70 dark:bg-gray-900/30'
  
  return 'bg-gray-100/70 dark:bg-gray-900/30'
}

/**
 * Format header label for display
 */
const formatHeaderLabel = (header: string): string => {
  return header
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Parse CSV string into headers and rows
 * Simple CSV parser that handles quoted fields
 */
const parseCsv = (csvString: string): { headers: string[], rows: string[][] } => {
  if (!csvString || !csvString.trim()) {
    throw new Error('CSV data is empty')
  }

  const lines = csvString.trim().split('\n')
  if (lines.length === 0) {
    throw new Error('No lines found in CSV data')
  }

  // Parse CSV line considering quoted fields
  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  // First line is headers
  const parsedHeaders = parseLine(lines[0])
  
  // Remaining lines are data rows
  const parsedRows: string[][] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line) {  // Skip empty lines
      parsedRows.push(parseLine(line))
    }
  }

  return {
    headers: parsedHeaders,
    rows: parsedRows
  }
}

/**
 * Generate filename for CSV download
 */
const generateFilename = (): string => {
  // Generate datetime string: YYYYMMDD_HHMMSS
  const now = new Date()
  const datetime = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    '_' +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0')
  
  if (props.title) {
    // Convert title to snake_case and make it filesystem-safe
    const safeName = props.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
    return `${safeName}_${datetime}.csv`
  }
  return `data_${datetime}.csv`
}

/**
 * Download CSV file
 */
const downloadCsv = () => {
  try {
    // Create blob from CSV data
    const blob = new Blob([props.csvData], { type: 'text/csv;charset=utf-8;' })
    
    // Create download link
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', generateFilename())
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Error downloading CSV:', e)
    error.value = 'Failed to download CSV file'
  }
}

onMounted(() => {
  try {
    const parsed = parseCsv(props.csvData)
    headers.value = parsed.headers
    rows.value = parsed.rows
    
    // Set initial expand state based on row count
    // Single row: Show KPI cards (isExpanded = false)
    // Multiple rows: Show expanded table (isExpanded = true)
    isExpanded.value = rows.value.length > 1
  } catch (e) {
    console.error('Error parsing CSV:', e)
    error.value = e instanceof Error ? e.message : 'Unknown parsing error'
  }
})
</script>

<style scoped>
.csv-table-container {
  max-width: 100%;
}

.table-wrapper {
  /* Custom scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-text-secondary);
}

.csv-table {
  border-collapse: separate;
  border-spacing: 0;
}

/* KPI Cards Styling */
.kpi-cards-container {
  max-width: 100%;
}

.kpi-card {
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Glass-morphism effect */
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

.kpi-card:hover {
  border-color: currentColor;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .kpi-card {
    min-height: 90px;
  }
}
</style>

