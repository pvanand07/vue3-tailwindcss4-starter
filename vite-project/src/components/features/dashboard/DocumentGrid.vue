<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    console.log('Opening document:', document.doc_name, document.doc_id)
    console.log('Fetching detail for user:', document.user_id, 'doc:', document.doc_id)
    await documentStore.fetchDocumentDetail(document.user_id, document.doc_id)
    console.log('Document detail fetched successfully')
  } catch (error) {
    console.error('Error opening document:', error)
  }
}
</script>
