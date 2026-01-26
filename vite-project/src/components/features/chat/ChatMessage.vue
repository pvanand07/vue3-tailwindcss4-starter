<template>
  <div class="w-full">
    <!-- AI Message -->
    <div v-if="message.role === 'assistant'" class="flex gap-3 mb-6">
      <div class="flex-1 max-w-full">
        <div class="max-w-full w-full">
          <!-- Thinking Section -->
          <div v-if="message.tools && message.tools.length > 0" class="bg-[var(--color-icon-bg)] border border-[var(--color-border)] rounded-lg mb-4 overflow-hidden">
            <div 
              class="bg-[var(--color-surface)] p-3 cursor-pointer flex items-center justify-between font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-icon-bg)] transition-colors duration-200 select-none"
              @click="toggleThinking"
              role="button"
              :aria-expanded="message.thinkingExpanded"
              aria-controls="thinking-content"
            >
              <span>🤔 Thinking...</span>
              <span class="text-xs transition-transform duration-200" :class="{ 'rotate-180': message.thinkingExpanded }">▼</span>
            </div>
            <div 
              id="thinking-content"
              class="transition-all duration-300 overflow-hidden" 
              :class="message.thinkingExpanded ? 'max-h-[800px] p-4' : 'max-h-0 p-0'"
            >
              <div class="max-h-[800px] overflow-y-auto scrollbar-thin">
                <!-- Tool execution details -->
                <div v-for="(tool, toolIndex) in message.tools" :key="toolIndex" class="mb-3 p-3 bg-[var(--color-surface)] rounded-md border-l-4 border-[var(--color-primary-blue)]">
                  <div class="font-semibold text-[var(--color-primary-blue)] text-sm mb-2">🔧 {{ tool.name }}</div>
                  <div class="bg-[var(--color-icon-bg)] p-2 rounded text-xs font-mono text-[var(--color-primary-blue)] mb-2 break-all">{{ tool.input }}</div>
                  <div v-if="tool.reasoning" class="text-[var(--color-text-secondary)] italic text-xs leading-relaxed">💭 {{ tool.reasoning }}</div>
                </div>
                
                <!-- Auto-display visualizations not referenced inline -->
                <div v-if="visualizations.length > 0" class="mt-4">
                  <div class="text-xs font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wide">
                    📊 Generated Visualizations
                  </div>
                  <PlotlyChart 
                    v-for="viz in visualizations" 
                    :key="viz.id" 
                    :plotly-fig-json="viz.json"
                  />
                </div>
                
                <!-- Auto-display CSV tables not referenced inline -->
                <div v-if="csvTables.length > 0" class="mt-4">
                  <div class="text-xs font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wide">
                    📋 Generated Data Tables
                  </div>
                  <CsvTable 
                    v-for="table in csvTables" 
                    :key="table.id" 
                    :csv-data="table.csvData"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Bot Response Content -->
          <div class="text-[var(--color-text-primary)] max-w-full w-full">
            <!-- Render content segments (text and inline artifacts) -->
            <template v-for="(segment, segmentIndex) in contentSegments" :key="`segment-${segmentIndex}`">
              <!-- Text segment -->
              <MarkdownRenderer 
                v-if="segment.type === 'text'" 
                :content="segment.content"
                @add-to-input="$emit('add-to-input', $event)"
              />
              
              <!-- Plotly chart segment (inline) -->
              <PlotlyChart 
                v-else-if="segment.type === 'artifact'" 
                :plotly-fig-json="segment.plotlyJson!"
              />
              
              <!-- CSV table segment (inline) -->
              <CsvTable 
                v-else-if="segment.type === 'csv-artifact'" 
                :csv-data="segment.csvData!"
                :title="segment.artifactTitle"
              />
              
              <!-- Loading artifact placeholder -->
              <div 
                v-else-if="segment.type === 'loading-artifact'" 
                class="inline-block bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-md text-sm my-2"
                role="status"
              >
                <span class="font-medium">⏳ Loading artifact...</span>
                <span class="font-mono text-xs ml-2">{{ segment.artifactId }}</span>
              </div>
              
              <!-- Missing artifact placeholder -->
              <div 
                v-else-if="segment.type === 'missing-artifact'" 
                class="inline-block bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-3 py-2 rounded-md text-sm my-2"
                role="alert"
              >
                <span class="font-medium">⚠️ Artifact not found:</span>
                <span class="font-mono text-xs ml-2">{{ segment.artifactId }}</span>
                <span v-if="segment.artifactType" class="text-xs ml-2">({{ segment.artifactType }})</span>
              </div>
            </template>
            
            
            <!-- Stop Streaming Button -->
            <div v-if="message.isLoading" class="mt-3">
              <button 
                @click="$emit('cancel-request')" 
                class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] bg-[var(--color-icon-bg)] hover:opacity-80 rounded-md px-3 py-1.5 transition-colors"
                aria-label="Stop generating response"
              >
                <Square class="w-4 h-4" />
                <span>Stop</span>
              </button>
            </div>

            <!-- Bot actions -->
            <div class="flex items-center gap-4 mt-3 text-[var(--color-icon-default)]">
               <button @click="copyMessage" class="hover:text-[var(--color-icon-active)] transition-colors" aria-label="Like response">
                   <ThumbsUp class="w-4 h-4" />
               </button>
               <button class="hover:text-[var(--color-icon-active)] transition-colors" aria-label="Dislike response">
                   <ThumbsDown class="w-4 h-4" />
               </button>
               <button @click="copyMessage" class="hover:text-[var(--color-icon-active)] transition-colors" aria-label="Copy message">
                   <Copy class="w-4 h-4" />
               </button>
               <button class="hover:text-[var(--color-icon-active)] transition-colors" aria-label="Share message">
                   <Share2 class="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- User Message -->
    <div v-else-if="message.role === 'user'" class="flex justify-end mb-6">
      <div class="max-w-2xl">
        <div class="bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] text-[var(--color-text-primary)] p-4 rounded-xl rounded-br-none">
          <!-- Message Content -->
          <p class="text-sm md:text-base leading-relaxed">{{ message.content }}</p>
        </div>
      </div>
    </div>

    <!-- System Message -->
    <div v-else-if="message.role === 'system'" class="flex justify-center mb-6">
      <div class="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-lg text-sm" role="status">
        {{ message.content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ThumbsUp, ThumbsDown, Copy, Share2, Square } from 'lucide-vue-next'
import MarkdownRenderer from './MarkdownRenderer.vue'
import PlotlyChart from './PlotlyChart.vue'
import CsvTable from './CsvTable.vue'
import type { ChatMessage } from '../../../types/chat'
import { fetchArtifact, isCsvArtifact, isPlotlyArtifact } from '../../../api/artifacts'
import { useChatStore } from '../../../stores/chat'

interface Props {
  message: ChatMessage
  messageIndex: number
}

interface Emits {
  (e: 'toggle-thinking', index: number): void
  (e: 'copy-message', text: string): void
  (e: 'cancel-request'): void
  (e: 'add-to-input', text: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const chatStore = useChatStore()

// Regex pattern to match artifact references
// Matches patterns like:
// - <artifact_id="uuid" type="text/csv">
// - <artifact_id="uuid" type="text/csv" title="My Data">
// - <artifact_id='uuid' type='application/vnd.plotly.v1+json' title='Chart Title'>
// Captures: [1] = artifact_id (UUID), [2] = type (MIME type), [3] = title (optional)
const ARTIFACT_PATTERN = /<artifact_id=['"]?([a-f0-9-]+)['"]?\s+type=['"]([^'"]+)['"](?:\s+title=['"]([^'"]+)['"])?>/gi

// Build artifact maps from tool_events
// For Plotly: artifact_id → plotly_fig_json
// For CSV: artifact_id → csv string (output)
const plotlyArtifactMap = computed(() => {
  const map = new Map<string, string>()
  
  if (!props.message.tool_events) {
    return map
  }
  
  props.message.tool_events
    .filter(event => 
      event.type === 'tool_end' && 
      event.artifacts_data?.artifact_type === 'application/vnd.plotly.v1+json' &&
      event.artifacts_data?.plotly_fig_json &&
      event.artifacts_data?.artifact_id
    )
    .forEach(event => {
      map.set(event.artifacts_data!.artifact_id, event.artifacts_data!.plotly_fig_json!)
    })
  
  return map
})

const csvArtifactMap = computed(() => {
  const map = new Map<string, string>()
  
  if (!props.message.tool_events) {
    return map
  }
  
  props.message.tool_events
    .filter(event => 
      event.type === 'tool_end' && 
      event.artifacts_data?.artifact_type === 'text/csv' &&
      event.artifacts_data?.output &&
      event.artifacts_data?.artifact_id
    )
    .forEach(event => {
      map.set(event.artifacts_data!.artifact_id, event.artifacts_data!.output!)
    })
  
  return map
})

// Cache for API-fetched artifacts to avoid duplicate requests
const apiFetchedArtifacts = ref<Map<string, { type: string, data: string }>>(new Map())

// Parse content into segments (text and artifact references)
interface ContentSegment {
  type: 'text' | 'artifact' | 'csv-artifact' | 'missing-artifact' | 'loading-artifact'
  content: string
  artifactId?: string
  artifactType?: string
  artifactTitle?: string
  plotlyJson?: string
  csvData?: string
}

const contentSegments = computed((): ContentSegment[] => {
  const content = props.message.content
  if (!content) {
    return []
  }

  const segments: ContentSegment[] = []
  let lastIndex = 0
  
  // Reset regex state
  ARTIFACT_PATTERN.lastIndex = 0
  
  let match: RegExpExecArray | null
  while ((match = ARTIFACT_PATTERN.exec(content)) !== null) {
    const artifactId = match[1]
    const artifactType = match[2]
    const artifactTitle = match[3] // Optional title
    const matchStart = match.index
    const matchEnd = ARTIFACT_PATTERN.lastIndex
    
    // Add text segment before the artifact reference (if any)
    if (matchStart > lastIndex) {
      const textContent = content.substring(lastIndex, matchStart)
      if (textContent.trim()) {
        segments.push({
          type: 'text',
          content: textContent
        })
      }
    }
    
    // PRIORITY 1: Check tool_events for artifact data (fast, no API call)
    if (isPlotlyArtifact(artifactType)) {
      const plotlyJson = plotlyArtifactMap.value.get(artifactId)
      if (plotlyJson) {
        segments.push({
          type: 'artifact',
          content: match[0],
          artifactId,
          artifactType,
          artifactTitle,
          plotlyJson
        })
        lastIndex = matchEnd
        continue
      }
    } else if (isCsvArtifact(artifactType)) {
      const csvData = csvArtifactMap.value.get(artifactId)
      if (csvData) {
        segments.push({
          type: 'csv-artifact',
          content: match[0],
          artifactId,
          artifactType,
          artifactTitle,
          csvData
        })
        lastIndex = matchEnd
        continue
      }
    }
    
    // PRIORITY 2: Check API-fetched cache
    const cachedArtifact = apiFetchedArtifacts.value.get(artifactId)
    if (cachedArtifact) {
      if (isPlotlyArtifact(cachedArtifact.type)) {
        segments.push({
          type: 'artifact',
          content: match[0],
          artifactId,
          artifactType: cachedArtifact.type,
          artifactTitle,
          plotlyJson: cachedArtifact.data
        })
      } else if (isCsvArtifact(cachedArtifact.type)) {
        segments.push({
          type: 'csv-artifact',
          content: match[0],
          artifactId,
          artifactType: cachedArtifact.type,
          artifactTitle,
          csvData: cachedArtifact.data
        })
      }
      lastIndex = matchEnd
      continue
    }
    
    // PRIORITY 3: Fetch from API (fallback)
    // Show loading state initially, will be updated when fetch completes
    segments.push({
      type: 'loading-artifact',
      content: match[0],
      artifactId,
      artifactType,
      artifactTitle
    })
    
    // Trigger API fetch (async)
    fetchArtifactFromAPI(artifactId, artifactType)
    
    lastIndex = matchEnd
  }
  
  // Add remaining text after the last match
  if (lastIndex < content.length) {
    const textContent = content.substring(lastIndex)
    if (textContent.trim()) {
      segments.push({
        type: 'text',
        content: textContent
      })
    }
  }
  
  // If no artifacts were found, return the whole content as a single text segment
  if (segments.length === 0 && content.trim()) {
    segments.push({
      type: 'text',
      content
    })
  }
  
  return segments
})

/**
 * Fetch artifact from API and cache the result
 */
async function fetchArtifactFromAPI(artifactId: string, artifactType: string) {
  // Skip if already fetching or cached
  if (apiFetchedArtifacts.value.has(artifactId)) {
    return
  }
  
  // Get user ID from store
  const userId = chatStore.userId
  if (!userId) {
    console.warn('Cannot fetch artifact: user ID not set')
    apiFetchedArtifacts.value.set(artifactId, {
      type: 'error',
      data: ''
    })
    return
  }
  
  try {
    const threadId = props.message.thread_id
    
    const response = await fetchArtifact(artifactId, userId, threadId)
    
    // Extract data based on artifact type
    let data: string
    if (isPlotlyArtifact(artifactType)) {
      data = response.artifact_data.plotly_fig_json || response.artifact_data.output
    } else if (isCsvArtifact(artifactType)) {
      data = response.artifact_data.output
    } else {
      data = response.artifact_data.output
    }
    
    // Cache the fetched data
    apiFetchedArtifacts.value.set(artifactId, {
      type: response.artifact_data.artifact_type,
      data
    })
  } catch (error) {
    console.error(`Failed to fetch artifact ${artifactId}:`, error)
    // Cache error state to prevent infinite retries
    apiFetchedArtifacts.value.set(artifactId, {
      type: 'error',
      data: ''
    })
  }
}

// Get set of artifact IDs that are referenced in the content
const referencedArtifactIds = computed(() => {
  const ids = new Set<string>()
  const content = props.message.content
  
  if (!content) {
    return ids
  }
  
  // Reset regex state
  ARTIFACT_PATTERN.lastIndex = 0
  
  let match: RegExpExecArray | null
  while ((match = ARTIFACT_PATTERN.exec(content)) !== null) {
    ids.add(match[1])  // match[1] is the artifact_id
  }
  
  return ids
})

// Extract visualizations from tool_events, excluding those already referenced inline
const visualizations = computed(() => {
  if (!props.message.tool_events) {
    return []
  }
  
  const referencedIds = referencedArtifactIds.value
  
  return props.message.tool_events
    .filter(event => 
      event.type === 'tool_end' && 
      event.artifacts_data?.artifact_type === 'application/vnd.plotly.v1+json' &&
      event.artifacts_data?.plotly_fig_json &&
      // Exclude artifacts that are already referenced inline
      !referencedIds.has(event.artifacts_data.artifact_id)
    )
    .map(event => ({
      id: event.artifacts_data!.artifact_id,
      json: event.artifacts_data!.plotly_fig_json!
    }))
})

// Extract CSV tables from tool_events, excluding those already referenced inline
const csvTables = computed(() => {
  if (!props.message.tool_events) {
    return []
  }
  
  const referencedIds = referencedArtifactIds.value
  
  return props.message.tool_events
    .filter(event => 
      event.type === 'tool_end' && 
      event.artifacts_data?.artifact_type === 'text/csv' &&
      event.artifacts_data?.output &&
      // Exclude artifacts that are already referenced inline
      !referencedIds.has(event.artifacts_data.artifact_id)
    )
    .map(event => ({
      id: event.artifacts_data!.artifact_id,
      csvData: event.artifacts_data!.output!
    }))
})

const toggleThinking = () => {
  emit('toggle-thinking', props.messageIndex)
}

const copyMessage = async () => {
  emit('copy-message', props.message.content)
}
</script>