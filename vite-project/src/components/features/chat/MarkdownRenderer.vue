<template>
  <div class="markdown-content text-sm md:text-base leading-relaxed">
    <template v-for="(segment, index) in contentSegments" :key="`segment-${index}`">
      <!-- Text segment - render as markdown -->
      <div 
        v-if="segment.type === 'text'" 
        v-html="segment.renderedMarkdown"
      />
      
      <!-- Question/Option block -->
      <QuestionOption
        v-else-if="segment.type === 'question-options'"
        :content="segment.content"
        @add-to-input="handleAddToInput"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import QuestionOption from './QuestionOption.vue'
import { stripQuestionOptionTags } from '../../../utils/contentParser'

interface Props {
  content: string
  class?: string
}

interface Emits {
  (e: 'add-to-input', text: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Configure markdown-it with sensible defaults
const md = new MarkdownIt({
  html: false, // Disable HTML tags for security
  linkify: true, // Auto-convert URLs to links
  breaks: true, // Convert '\n' to <br>
  typographer: true, // Enable smart quotes and other typographic replacements
})

// Custom renderer for code blocks to add proper CSS classes
md.renderer.rules.fence = (tokens: any[], idx: number) => {
  const token = tokens[idx]
  const info = token.info ? token.info.trim() : ''
  const lang = info ? info.split(/\s+/g)[0] : ''
  
  return `<div class="code-block">
    ${lang ? `<div class="code-header">${lang}</div>` : ''}
    <pre class="code-content"><code${lang ? ` class="language-${lang}"` : ''}>${md.utils.escapeHtml(token.content)}</code></pre>
  </div>`
}

// Custom renderer for inline code
md.renderer.rules.code_inline = (tokens: any[], idx: number) => {
  const token = tokens[idx]
  return `<code class="inline-code">${md.utils.escapeHtml(token.content)}</code>`
}

// Check if content contains question/option tags
const hasQuestionOptionTags = (text: string): boolean => {
  return /<question>|<option>/.test(text)
}

interface ContentSegment {
  type: 'text' | 'question-options'
  content: string
  renderedMarkdown?: string
}

// Parse content into segments (text and question/option blocks)
const contentSegments = computed((): ContentSegment[] => {
  const content = props.content
  if (!content) {
    return []
  }

  // If content doesn't contain question/option tags, return as single text segment
  if (!hasQuestionOptionTags(content)) {
    return [{
      type: 'text',
      content,
      renderedMarkdown: md.render(content)
    }]
  }

  const segments: ContentSegment[] = []
  
  // Find all question/option tag positions
  // Pattern matches: <question>...</question>, <option>...</option>, or <question/>
  const tagPattern = /<question>.*?<\/question>|<option>.*?<\/option>|<question\s*\/>/gs
  const matches: Array<{ start: number; end: number; content: string }> = []
  
  let match: RegExpExecArray | null
  tagPattern.lastIndex = 0
  while ((match = tagPattern.exec(content)) !== null) {
    matches.push({
      start: match.index,
      end: tagPattern.lastIndex,
      content: match[0]
    })
  }

  if (matches.length === 0) {
    return [{
      type: 'text',
      content,
      renderedMarkdown: md.render(content)
    }]
  }

  // Group consecutive question/option tags into blocks
  let lastIndex = 0
  let currentBlock: string[] = []
  let blockStart = matches[0].start

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const prevMatch = i > 0 ? matches[i - 1] : null
    
    // Check if this match is part of the current block (within reasonable distance)
    const isConsecutive = !prevMatch || (match.start - prevMatch.end) < 100
    
    if (isConsecutive) {
      currentBlock.push(match.content)
    } else {
      // Save current block and start a new one
      if (currentBlock.length > 0) {
        // Add text before block
        if (blockStart > lastIndex) {
          const textContent = content.substring(lastIndex, blockStart)
          if (textContent.trim()) {
            segments.push({
              type: 'text',
              content: textContent,
              renderedMarkdown: md.render(textContent)
            })
          }
        }
        
        // Add question/option block
        segments.push({
          type: 'question-options',
          content: currentBlock.join(' ')
        })
        
        lastIndex = matches[i - 1].end
      }
      
      currentBlock = [match.content]
      blockStart = match.start
    }
  }

  // Handle the last block
  if (currentBlock.length > 0) {
    // Add text before block
    if (blockStart > lastIndex) {
      const textContent = content.substring(lastIndex, blockStart)
      if (textContent.trim()) {
        segments.push({
          type: 'text',
          content: textContent,
          renderedMarkdown: md.render(textContent)
        })
      }
    }
    
    // Add question/option block
    segments.push({
      type: 'question-options',
      content: currentBlock.join(' ')
    })
    
    lastIndex = matches[matches.length - 1].end
  }

  // Add remaining text after the last block
  if (lastIndex < content.length) {
    const textContent = content.substring(lastIndex)
    if (textContent.trim()) {
      segments.push({
        type: 'text',
        content: textContent,
        renderedMarkdown: md.render(textContent)
      })
    }
  }
  
  return segments
})

const handleAddToInput = (text: string) => {
  emit('add-to-input', text)
}
</script>

<style scoped>
@reference "../../../style.css";

.markdown-content :deep(h1) {
  @apply text-2xl font-bold mt-6 mb-4 first:mt-0;
  color: var(--color-text-primary);
}

.markdown-content :deep(h2) {
  @apply text-xl font-bold mt-5 mb-3 first:mt-0;
  color: var(--color-text-primary);
}

.markdown-content :deep(h3) {
  @apply text-lg font-semibold mt-4 mb-2 first:mt-0;
  color: var(--color-text-primary);
}

.markdown-content :deep(h4) {
  @apply text-base font-semibold mt-3 mb-2 first:mt-0;
  color: var(--color-text-primary);
}

.markdown-content :deep(h5) {
  @apply text-sm font-semibold mt-3 mb-2 first:mt-0;
  color: var(--color-text-primary);
}

.markdown-content :deep(h6) {
  @apply text-sm font-medium mt-3 mb-2 first:mt-0;
  color: var(--color-text-secondary);
}

.markdown-content :deep(p) {
  @apply mb-4 last:mb-0;
}

.markdown-content :deep(ul) {
  @apply mb-4 pl-6 space-y-1;
}

.markdown-content :deep(ol) {
  @apply mb-4 pl-6 space-y-1;
}

.markdown-content :deep(li) {
  @apply list-disc;
}

.markdown-content :deep(ol li) {
  @apply list-decimal;
}

.markdown-content :deep(blockquote) {
  @apply border-l-4 pl-4 py-2 mb-4 italic;
  border-color: var(--color-border);
  color: var(--color-text-secondary);
  background-color: var(--color-icon-bg);
}

.markdown-content :deep(a) {
  @apply underline;
  color: var(--color-primary-blue);
}

.markdown-content :deep(a:hover) {
  color: var(--color-primary-blue-hover);
}

.markdown-content :deep(strong) {
  @apply font-semibold;
  color: var(--color-text-primary);
}

.markdown-content :deep(em) {
  @apply italic;
}

.markdown-content :deep(hr) {
  @apply border-0 border-t my-6;
  border-color: var(--color-border);
}

.markdown-content :deep(table) {
  @apply w-full border-collapse border mb-4;
  border-color: var(--color-border);
}

.markdown-content :deep(th) {
  @apply border px-3 py-2 font-semibold text-left;
  border-color: var(--color-border);
  background-color: var(--color-icon-bg);
  color: var(--color-text-primary);
}

.markdown-content :deep(td) {
  @apply border px-3 py-2;
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

/* Code styling */
.markdown-content :deep(.code-block) {
  @apply mb-4 rounded-lg overflow-hidden bg-slate-900;
}

.markdown-content :deep(.code-header) {
  @apply bg-slate-800 text-slate-300 px-4 py-2 text-xs font-medium border-b border-slate-700;
}

.markdown-content :deep(.code-content) {
  @apply p-4 overflow-x-auto;
}

.markdown-content :deep(.code-content code) {
  @apply text-sm text-slate-100 font-mono;
}

.markdown-content :deep(.inline-code) {
  @apply px-1.5 py-0.5 rounded text-sm font-mono;
  background-color: var(--color-icon-bg);
  color: var(--color-text-primary);
}

/* Improve spacing for nested lists */
.markdown-content :deep(li > ul),
.markdown-content :deep(li > ol) {
  @apply mt-2 mb-0;
}
</style>