<script setup lang="ts">
import { ref } from 'vue'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

const messages = ref<Message[]>([
  {
    id: 1,
    text: 'Hello! How can I help you today?',
    sender: 'bot',
    timestamp: new Date()
  }
])

const newMessage = ref('')

const sendMessage = () => {
  if (newMessage.value.trim()) {
    // Add user message
    messages.value.push({
      id: Date.now(),
      text: newMessage.value,
      sender: 'user',
      timestamp: new Date()
    })

    // Simulate bot response
    setTimeout(() => {
      messages.value.push({
        id: Date.now() + 1,
        text: `You said: "${newMessage.value}". This is a demo response!`,
        sender: 'bot',
        timestamp: new Date()
      })
    }, 1000)

    newMessage.value = ''
  }
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <!-- Header -->
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h1 class="text-xl font-semibold text-gray-900">Chat</h1>
        <p class="text-gray-600 text-sm">Simple messaging demo</p>
      </div>

      <!-- Messages -->
      <div class="h-96 overflow-y-auto p-4 space-y-4">
        <div 
          v-for="message in messages" 
          :key="message.id"
          :class="[
            'flex',
            message.sender === 'user' ? 'justify-end' : 'justify-start'
          ]"
        >
          <div 
            :class="[
              'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
              message.sender === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800'
            ]"
          >
            <p class="text-sm">{{ message.text }}</p>
            <p 
              :class="[
                'text-xs mt-1',
                message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
              ]"
            >
              {{ formatTime(message.timestamp) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="border-t border-gray-200 p-4">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Type your message..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  </div>
</template> 