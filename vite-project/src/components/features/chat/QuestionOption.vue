<template>
  <div class="my-4 space-y-4">
    <!-- Questions with Options -->
    <div v-for="(item, qIndex) in parsedData.questionsWithOptions" :key="`qwo-${qIndex}`" class="space-y-3">
      <!-- Question Label -->
      <div class="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
        {{ item.question }}
      </div>
      
      <!-- Options as Bubble Chips -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="(option, index) in item.options"
          :key="index"
          @click="toggleQuestionOption(qIndex, index)"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            'border-2 cursor-pointer select-none',
            getQuestionOptionSelected(qIndex, index)
              ? 'bg-[var(--color-primary-blue)] text-white border-[var(--color-primary-blue)] shadow-md'
              : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-primary-blue)] hover:bg-[var(--color-icon-bg)]'
          ]"
          :aria-pressed="getQuestionOptionSelected(qIndex, index)"
          :aria-label="`Select option: ${option}`"
        >
          {{ option }}
        </button>
      </div>
    </div>
    
    <!-- Standalone Questions (No Options) -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="(question, index) in parsedData.questionsOnly"
        :key="`q-${index}`"
        @click="handleQuestionClick(question)"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] border-2 border-[var(--color-border)] hover:border-[var(--color-primary-blue)] hover:bg-[var(--color-icon-bg)] cursor-pointer select-none"
        :aria-label="`Insert question: ${question}`"
      >
        {{ question }}
      </button>
    </div>
    
    <!-- Standalone Options Only -->
    <div v-if="parsedData.optionsOnly.length > 0" class="space-y-2">
      <div class="text-xs text-[var(--color-text-secondary)] mb-1">Options:</div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="(option, index) in parsedData.optionsOnly"
          :key="`opt-${index}`"
          @click="toggleStandaloneOption(index)"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            'border-2 cursor-pointer select-none',
            standaloneOptionsSelected.has(index)
              ? 'bg-[var(--color-primary-blue)] text-white border-[var(--color-primary-blue)] shadow-md'
              : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-primary-blue)] hover:bg-[var(--color-icon-bg)]'
          ]"
          :aria-pressed="standaloneOptionsSelected.has(index)"
          :aria-label="`Select option: ${option}`"
        >
          {{ option }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseQuestionOptions, type ParsedQuestionOptions } from '../../../utils/contentParser'

interface Props {
  content: string
}

interface Emits {
  (e: 'add-to-input', text: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Parse the content
const parsedData = computed<ParsedQuestionOptions>(() => {
  return parseQuestionOptions(props.content)
})

// Track selected options for questions with options
// Map: questionIndex -> Set<optionIndex>
const questionOptionsSelected = ref<Map<number, Set<number>>>(new Map())

// Track selected standalone options
const standaloneOptionsSelected = ref<Set<number>>(new Set())

// Get selection state for a question's option
const getQuestionOptionSelected = (questionIndex: number, optionIndex: number): boolean => {
  return questionOptionsSelected.value.get(questionIndex)?.has(optionIndex) ?? false
}

// Toggle option selection for a question with options
const toggleQuestionOption = (questionIndex: number, optionIndex: number) => {
  if (!questionOptionsSelected.value.has(questionIndex)) {
    questionOptionsSelected.value.set(questionIndex, new Set())
  }
  
  const selectedSet = questionOptionsSelected.value.get(questionIndex)!
  const questionData = parsedData.value.questionsWithOptions[questionIndex]
  const optionText = questionData.options[optionIndex]
  
  if (selectedSet.has(optionIndex)) {
    // Deselecting - remove from set (don't emit, as we can't easily remove from input)
    selectedSet.delete(optionIndex)
  } else {
    // Selecting - add to set and emit only this option
    selectedSet.add(optionIndex)
    emit('add-to-input', optionText)
  }
}

// Toggle standalone option selection
const toggleStandaloneOption = (index: number) => {
  const optionText = parsedData.value.optionsOnly[index]
  
  if (standaloneOptionsSelected.value.has(index)) {
    // Deselecting - remove from set (don't emit, as we can't easily remove from input)
    standaloneOptionsSelected.value.delete(index)
  } else {
    // Selecting - add to set and emit only this option
    standaloneOptionsSelected.value.add(index)
    emit('add-to-input', optionText)
  }
}

// Handle standalone question click
const handleQuestionClick = (question: string) => {
  // For questions only, add the question itself to input
  emit('add-to-input', question)
}
</script>

