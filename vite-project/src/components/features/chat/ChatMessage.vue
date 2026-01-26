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
              :class="message.thinkingExpanded ? 'max-h-96 p-4' : 'max-h-0 p-0'"
            >
              <div class="max-h-96 overflow-y-auto scrollbar-thin">
                <div v-for="(tool, toolIndex) in message.tools" :key="toolIndex" class="mb-3 p-3 bg-[var(--color-surface)] rounded-md border-l-4 border-[var(--color-primary-blue)]">
                  <div class="font-semibold text-[var(--color-primary-blue)] text-sm mb-2">🔧 {{ tool.name }}</div>
                  <div class="bg-[var(--color-icon-bg)] p-2 rounded text-xs font-mono text-[var(--color-primary-blue)] mb-2 break-all">{{ tool.input }}</div>
                  <div v-if="tool.reasoning" class="text-[var(--color-text-secondary)] italic text-xs leading-relaxed">💭 {{ tool.reasoning }}</div>
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
              
              <!-- Artifact segment (inline chart) -->
              <PlotlyChart 
                v-else-if="segment.type === 'artifact'" 
                :plotly-fig-json="segment.plotlyJson!"
              />
              
              <!-- Missing artifact placeholder -->
              <div 
                v-else-if="segment.type === 'missing-artifact'" 
                class="inline-block bg-amber-50 border border-amber-300 text-amber-800 px-3 py-2 rounded-md text-sm my-2"
                role="alert"
              >
                <span class="font-medium">⚠️ Chart not found:</span>
                <span class="font-mono text-xs ml-2">{{ segment.artifactId }}</span>
              </div>
            </template>
            
            <!-- Plotly Visualizations (for backward compatibility - auto-display all charts at end) -->
            <div v-if="visualizations.length > 0" class="visualizations-container">
              <PlotlyChart 
                v-for="viz in visualizations" 
                :key="viz.id" 
                :plotly-fig-json="viz.json"
              />
            </div>
            
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
import { computed } from 'vue'
import { ThumbsUp, ThumbsDown, Copy, Share2, Square } from 'lucide-vue-next'
import MarkdownRenderer from './MarkdownRenderer.vue'
import PlotlyChart from './PlotlyChart.vue'
import type { ChatMessage } from '../../../types/chat'

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

// Regex pattern to match artifact references
// Matches patterns like:
// - <artifact_id="uuid">
// - <Customer Segmentation chart artifact_id="uuid">
// - <chart artifact_id='uuid'>
// - <Some Text artifact_id = "uuid">
const ARTIFACT_PATTERN = /<[^>]*\bartifact_id\s*=\s*["']([a-f0-9-]+)["'][^>]*>/gi

// Build artifact map from tool_events (artifact_id → plotly_fig_json)
const artifactMap = computed(() => {
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

// Parse content into segments (text and artifact references)
interface ContentSegment {
  type: 'text' | 'artifact' | 'missing-artifact'
  content: string
  artifactId?: string
  plotlyJson?: string
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
    
    // Add artifact segment
    const plotlyJson = artifactMap.value.get(artifactId)
    if (plotlyJson) {
      segments.push({
        type: 'artifact',
        content: match[0],
        artifactId,
        plotlyJson
      })
    } else {
      // Artifact not found - show placeholder
      segments.push({
        type: 'missing-artifact',
        content: match[0],
        artifactId
      })
    }
    
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
    ids.add(match[1])
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

const toggleThinking = () => {
  emit('toggle-thinking', props.messageIndex)
}

const copyMessage = async () => {
  emit('copy-message', props.message.content)
}
</script>