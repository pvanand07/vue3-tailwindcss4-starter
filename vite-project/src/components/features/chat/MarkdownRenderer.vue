<template>
  <div 
    v-html="renderedMarkdown" 
    class="markdown-content text-sm md:text-base leading-relaxed"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

interface Props {
  content: string
  class?: string
}

const props = defineProps<Props>()

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

const renderedMarkdown = computed(() => {
  return md.render(props.content)
})
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