<template>
  <div class="ai-assistant-card">
    <div class="ai-icon">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-2H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v9h16V6H4z"/>
      </svg>
    </div>
    <div class="ai-content">
      <h3>Assistant Console</h3>

      <!-- Chat Log -->
      <div v-if="chatLog.length > 0" class="chat-log" ref="chatLogRef">
        <div
          v-for="(entry, index) in chatLog"
          :key="index"
          class="chat-entry"
          :class="entry.type"
        >
          <div class="chat-avatar">
            <svg v-if="entry.type === 'user'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 12H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1zm0-3H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1zm0-3H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1z"/>
            </svg>
          </div>
          <div class="chat-message">
            <span class="chat-label">{{ entry.type === 'user' ? 'You' : 'Assistant' }}</span>
            <p class="chat-text">{{ entry.text }}</p>
          </div>
        </div>
      </div>

      <div class="ai-input-group">
        <input
          v-model="chatInput"
          type="text"
          class="ai-input"
          placeholder="e.g. show GES data for SMU, Information Systems"
          @keyup.enter="submitQuery"
        />
        <button class="btn-primary" @click="submitQuery" :disabled="loading">
          {{ loading ? 'Searching...' : 'Search' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const chatInput = ref('')
const loading = ref(false)
const errorMessage = ref('')
const chatLog = ref([])
const chatLogRef = ref(null)

// Initialize with greeting message
onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userHandle = user.handle || 'there'

  chatLog.value.push({
    type: 'assistant',
    text: `Hello ${userHandle}! I'm your AI assistant. Ask me anything about schools, GES data, news, or maps, and I'll help you navigate to the right information.`
  })
})

// Scroll to bottom of chat log
async function scrollToBottom() {
  await nextTick()
  if (chatLogRef.value) {
    chatLogRef.value.scrollTop = chatLogRef.value.scrollHeight
  }
}

async function submitQuery() {
  if (loading.value || !chatInput.value.trim()) return

  const userMessage = chatInput.value.trim()

  // Add user message to chat log
  chatLog.value.push({
    type: 'user',
    text: userMessage
  })

  scrollToBottom()

  loading.value = true
  errorMessage.value = ''
  chatInput.value = ''

  const token = localStorage.getItem('authToken')
  if (!token) {
    errorMessage.value = 'Authentication is required.'
    chatLog.value.push({
      type: 'assistant',
      text: 'Authentication is required. Please log in.'
    })
    scrollToBottom()
    loading.value = false
    return
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const payload = { prompt: userMessage }
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  try {
    const response = await axios.post(`${apiBaseUrl}/api/ai/route-from-prompt`, payload, config)
    const { action_type, api_route, message } = response.data

    if (action_type === 'API_CALL' && api_route) {
      // Add assistant response to chat log
      chatLog.value.push({
        type: 'assistant',
        text: message || 'Here is the data you requested. Navigating now...'
      })
      scrollToBottom()

      sessionStorage.setItem('ai_assistant_message', message || 'Here is the data you requested.')

      // Navigate after a short delay to show the message
      setTimeout(() => {
        router.push(api_route)
      }, 500)
    } else {
      const errorMsg = message || "I'm not sure how to handle that request."
      errorMessage.value = errorMsg
      chatLog.value.push({
        type: 'assistant',
        text: errorMsg
      })
      scrollToBottom()
    }

  } catch (err) {
    const errorMsg = err.response?.data?.message || 'An error occurred while contacting the assistant.'
    errorMessage.value = errorMsg
    chatLog.value.push({
      type: 'assistant',
      text: errorMsg
    })
    scrollToBottom()
  } finally {
    loading.value = false
  }
}
</script>
