<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import NavbarView from './views/NavbarView.vue'

const route = useRoute()
const isAuthPage = computed(() => route.path === '/login' || route.path === '/signup')

// --- AI Assistant Alert State ---
const assistantMessage = ref('')

// Function to check session storage for a message
function checkAssistantMessage() {
  const msg = sessionStorage.getItem('ai_assistant_message')
  if (msg) {
    assistantMessage.value = msg
    sessionStorage.removeItem('ai_assistant_message') // Clear after reading

    // Hide message after 5 seconds
    setTimeout(() => {
      assistantMessage.value = ''
    }, 5000)
  }
}

// Check for message on initial component mount
onMounted(checkAssistantMessage)

// Check for message on every route change
watch(() => route.fullPath, checkAssistantMessage)
</script>


<template>
  <div>
  <!-- AI Assistant Alert Box -->
    <transition name="fade">
      <div v-if="assistantMessage" class="assistant-alert" role="alert">
        {{ assistantMessage }}
        <button type="button" class="btn-close" @click="assistantMessage = ''" aria-label="Close"></button>
      </div>
    </transition>
  <NavbarView v-if="!isAuthPage" />
  <main class="flex-shrink-0" :class="{ 'content-with-navbar': !isAuthPage }">
    <!-- 
      By adding the :key="route.fullPath", we are telling Vue to treat each route as a unique component.
      This forces a complete remount of the component when the route changes, fixing the navigation issue.
    -->
    <router-view :key="route.fullPath" v-slot="{ Component }">
        <transition name="fade" mode="out-in">
            <component :is="Component" />
        </transition>
    </router-view>
  </main>
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

.content-with-navbar {
  padding-top: 70px;
}

body, #app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}
.flex-shrink-0 {
    flex-shrink: 0;
}

.assistant-alert {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1056;
  padding: 1rem 1.5rem;
  background-color: var(--bg-dark);
  color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 500px;
  font-family: "Inter", sans-serif;
  border: 2px solid var(--accent);
}

.assistant-alert .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
  opacity: 0.7;
  transition: opacity 0.3s ease;
}
.assistant-alert .btn-close:hover {
  opacity: 1;
}
</style>
