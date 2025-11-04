<template>
  <div class="simple-dashboard">
    <!-- Header with AI Assistant -->
    <div class="dashboard-header">
      <div class="container">
        <h1 class="dashboard-title">Hi <span class="username-highlight">{{ username }}</span></h1>
        <AIAssistant />
        <div class="dashboard-divider">School Finder Tools</div>
      </div>
    </div>

    <!-- App Grid (3x2) -->
    <div class="container">
      <div class="tools-grid">
        <div
          v-for="app in allApps"
          :key="app.name"
          class="tool-card"
          :style="{ backgroundImage: `url(${app.backgroundImage})` }"
          @click="openRoute(app.path)"
        >
          <div class="tool-overlay"></div>
          <div class="tool-content">
            <h3 class="tool-name">{{ app.name }}</h3>
            <p class="tool-description">{{ app.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AIAssistant from '@/components/AIAssistant.vue'
import '@/assets/dashboard.css'

const router = useRouter()
const username = ref('User')

// Get username from localStorage
onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    try {
      const userData = JSON.parse(user)
      username.value = userData.username || 'User'
    } catch (e) {
      username.value = 'User'
    }
  }
})

// Flatten all apps into a single array with background images
const allApps = computed(() => [
  {
    name: 'School Comparison',
    description: 'Compare schools side-by-side based on various criteria.',
    path: '/comparison',
    backgroundImage: '/src/assets/dashboard_images/school%20comparison.jpg'
  },
  {
    name: 'School CCA Comparison',
    description: 'CCA Comparison across all schools.',
    path: '/cca-finder',
    backgroundImage: '/src/assets/dashboard_images/cca.jpg'
  },
  {
    name: 'Unique Programmes',
    description: 'Explore the unique programmes each school has.',
    path: '/distinctProgramme',
    backgroundImage: '/src/assets/dashboard_images/programmes.webp'
  },
  {
    name: 'Graduate Employment Survey',
    description: 'Explore GES/ salary statistics for local universities.',
    path: '/ges',
    backgroundImage: '/src/assets/dashboard_images/graduation.jpg'
  },
  {
    name: 'News Management',
    description: 'Upload, analyze, and manage news articles. Used for salary sentiment analysis.',
    path: '/news',
    backgroundImage: '/src/assets/dashboard_images/news.jpg'
  },
  {
    name: 'Map Viewer',
    description: 'Visualize and track distances on an interactive map.',
    path: '/map',
    backgroundImage: '/src/assets/dashboard_images/maps.jpg'
  }
])

function openRoute(path) {
  if (path) router.push(path)
}
</script>

<style scoped>
.dashboard-title .username-highlight {
  color: #40E0D0;
}

.dashboard-divider {
  text-align: center;
  margin: 24px 0 0;
  font-family: "Poppins", sans-serif;
  font-size: 42px;
  font-weight: 700;
  color: var(--text-primary);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 0;
}

.tool-card {
  position: relative;
  height: 280px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--primary);
}

.tool-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6));
  transition: background 0.3s ease;
}

.tool-card:hover .tool-overlay {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7));
}

.tool-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24px;
}

.tool-name {
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  font-size: 22px;
  color: #ffffff;
  margin: 0 0 12px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

.tool-description {
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
  line-height: 1.5;
}

@media (max-width: 992px) {
  .tools-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }

  .tool-card {
    height: 220px;
  }
}
</style>
