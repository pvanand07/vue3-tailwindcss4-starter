<template>
  <LandingPage @get-started="navigateToChat" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import LandingPage from '../components/layout/LandingPage.vue'

const router = useRouter()

const navigateToChat = () => {
  router.push('/chat')
}
</script>