<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
    <DocumentCard 
      v-for="document in documents" 
      :key="document.doc_id"
      :document="document"
      @click="openDocument(document)"
      @delete="handleDeleteDocument(document)"
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
    if (!document.user_id) {
      console.error('Cannot open document: user_id is missing')
      return
    }
    await documentStore.fetchDocumentDetail(document.user_id, document.doc_id)
  } catch (error) {
    console.error('Error opening document:', error)
  }
}

const handleDeleteDocument = async (document: Document) => {
  if (!document.user_id) {
    console.error('Cannot delete document: user_id is missing')
    return
  }

  try {
    await documentStore.deleteDocument(document.user_id, document.doc_id)
    console.log('Document deleted successfully:', document.doc_id)
  } catch (error) {
    console.error('Error deleting document:', error)
    // Error is already set in the store, so we can show it in the UI
  }
}
</script>
