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
      <div v-if="chatLog.length > 0 || loading" class="chat-log" ref="chatLogRef">
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

        <!-- Loading Placeholder -->
        <div v-if="loading" class="chat-entry assistant loading-placeholder">
          <div class="chat-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 12H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1zm0-3H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1zm0-3H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1z"/>
            </svg>
          </div>
          <div class="chat-message">
            <span class="chat-label">Assistant</span>
            <div class="typing-indicator">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
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

      <!-- Add example prompts -->
      <div class="example-prompts">
        <span>Try:</span>
        <button class="example-prompt" @click="useExamplePrompt('Show GES data for SMU, Information Systems')">
          Show GES data for SMU, Information Systems
        </button>
        <button class="example-prompt" @click="useExamplePrompt('Compare Ai Tong and Kong Hwa Primary Schools')">
          Compare Ai Tong and Kong Hwa Primary Schools
        </button>
        <button class="example-prompt" @click="useExamplePrompt('Where is Broadrick Secondary')">
          Where is Broadrick Secondary
        </button>
        <button class="example-prompt" @click="useExamplePrompt('Show me distinct programs between Admiralty Secondary and Ang Mo Kio Secondary')">
          Show me distinct programs between Admiralty Secondary and Ang Mo Kio Secondary
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

// --- New function to use an example prompt ---
function useExamplePrompt(promptText) {
  chatInput.value = promptText
}

async function submitQuery() {
  if (loading.value || !chatInput.value.trim()) return

  const userMessage = chatInput.value.trim()

  // Add user message to chat log
  chatLog.value.push({
    type: 'user',
    text: userMessage
  })

  chatInput.value = ''
  loading.value = true
  errorMessage.value = ''

  // Scroll to show user message and loading placeholder
  await scrollToBottom()

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
    console.log(response);

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

<!-- Add scoped styles for the new elements -->
<style scoped>
.example-prompts {
  margin-top: 12px;
  font-size: 13px;
  color: #999999;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.example-prompt {
  background: #fff;
  border: 1px solid #FFA18D;
  color: #FFA18D;
  padding: 4px 10px;
  border-radius: 20px;
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.example-prompt:hover {
  color: #fff;
  background: #FFA18D;
  border-color: rgba(255, 161, 141, 0.5);
  transform: translateY(-1px);
}

/* Loading Placeholder Styles */
.loading-placeholder {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #56bdb6;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}
</style>

