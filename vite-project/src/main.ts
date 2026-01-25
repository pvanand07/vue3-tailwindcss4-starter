import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useUIStore } from './stores/ui'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

// Initialize theme before mounting to prevent flash
const uiStore = useUIStore()
uiStore.initialize()

app.mount('#app')
