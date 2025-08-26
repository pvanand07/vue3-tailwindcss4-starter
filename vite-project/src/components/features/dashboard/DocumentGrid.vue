<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
    <DocumentCard 
      v-for="document in documents" 
      :key="document.doc_id"
      :document="document"
      @click="openDocument(document)"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { Document } from '../../../types/document'
import { useDocumentStore } from '../../../stores/document'
import DocumentCard from './DocumentCard.vue'

defineProps<{
  documents: Document[]
}>()

const documentStore = useDocumentStore()

const openDocument = async (document: Document) => {
  try {
    await documentStore.fetchDocumentDetail(document.user_id, document.doc_id)
  } catch (error) {
    console.error('Error opening document:', error)
  }
}
</script>
