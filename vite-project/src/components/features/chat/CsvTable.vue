<template>
  <div class="csv-table-container my-4">
    <!-- Error State -->
    <div v-if="error" class="error-message bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg" role="alert">
      <span class="font-medium">⚠️ Failed to render CSV:</span>
      <span class="ml-2">{{ error }}</span>
    </div>

    <!-- Collapsed State: Button to expand table -->
    <div v-else-if="!isExpanded" class="csv-button-container">
      <button
        @click="toggleExpand"
        class="csv-expand-button flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] hover:bg-[var(--color-icon-bg)] border border-[var(--color-border)] rounded-lg transition-colors w-full text-left group"
        aria-label="View CSV table"
      >
        <!-- Sheets Icon -->
        <div class="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600 dark:text-green-400">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </div>
        
        <!-- Info -->
        <div class="flex-1">
          <div class="text-sm font-medium text-[var(--color-text-primary)]">
            CSV Data Table
          </div>
          <div class="text-xs text-[var(--color-text-secondary)]">
            {{ rowCount }} {{ rowCount === 1 ? 'row' : 'rows' }} • {{ headers.length }} {{ headers.length === 1 ? 'column' : 'columns' }}
          </div>
        </div>
        
        <!-- Download button -->
        <button
          @click.stop="downloadCsv"
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
        
        <!-- Expand indicator -->
        <div class="flex-shrink-0 text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary-blue)] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </button>
    </div>

    <!-- Expanded State: Full Table -->
    <div v-else class="table-card bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      <!-- Table Header with Controls -->
      <div class="table-header flex items-center justify-between px-4 py-3 bg-[var(--color-icon-bg)] border-b border-[var(--color-border)]">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600 dark:text-green-400">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span class="text-sm font-medium text-[var(--color-text-secondary)]">
            CSV Data ({{ rowCount }} {{ rowCount === 1 ? 'row' : 'rows' }})
          </span>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Download button -->
          <button 
            @click="downloadCsv" 
            class="download-button flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-blue)] hover:bg-[var(--color-surface)] rounded-md transition-colors"
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
          
          <!-- Collapse button -->
          <button
            @click="toggleExpand"
            class="collapse-button flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-blue)] hover:bg-[var(--color-surface)] rounded-md transition-colors"
            title="Collapse table"
            aria-label="Collapse table"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <span>Collapse</span>
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

interface Props {
  csvData: string
}

const props = defineProps<Props>()
const headers = ref<string[]>([])
const rows = ref<string[][]>([])
const error = ref<string>('')
const isExpanded = ref<boolean>(false)

const rowCount = computed(() => rows.value.length)

/**
 * Toggle table expand/collapse
 */
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
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
    link.setAttribute('download', `data_${new Date().getTime()}.csv`)
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
</style>

