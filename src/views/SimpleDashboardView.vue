<template>
  <div class="simple-dashboard">
    <!-- Header with AI Assistant -->
    <div class="dashboard-header">
      <div class="container">
        <h1 class="dashboard-title">Dashboard</h1>
        <AIAssistant />
      </div>
    </div>

    <!-- App Groups -->
    <div class="container">
      <div v-for="group in appGroups" :key="group.name" class="app-group">
        <h2 class="group-title">{{ group.name }}</h2>
        <div class="app-grid">
          <div
            v-for="app in group.apps"
            :key="app.name"
            class="app-card"
            @click="openRoute(app.path)"
          >
            <div class="app-icon" v-html="app.icon"></div>
            <h3 class="app-name">{{ app.name }}</h3>
            <p class="app-description">{{ app.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AIAssistant from '@/components/AIAssistant.vue'
import '@/assets/dashboard.css'

const router = useRouter()

const appGroups = ref([
  {
    name: 'Primary/ Secondary/ Junior College',
    apps: [
      {
        name: 'School Comparison',
        description: 'Compare schools side-by-side based on various criteria.',
        path: '/comparison',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-layout-split" viewBox="0 0 16 16"><path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm8.5-1v12H14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM7.5 2V14H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/></svg>`,
      },
      {
        name: 'School CCA Comparison',
        description: 'CCA Comparison across all schools.',
        path: '/cca-finder',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16"><path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/></svg>`,
      },
      {
        name: 'Unique Programmes',
        description: 'Explore the unique programmes each school has.',
        path: '/distinctProgramme',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-award-fill" viewBox="0 0 16 16"><path d="m8 0 1.669.864 1.858.282.842 1.68 1.337 1.32L13.4 6l.306 1.854-1.337 1.32-.842 1.68-1.858.282L8 12l-1.669-.864-1.858-.282-.842-1.68-1.337-1.32L2.6 6l-.306-1.854 1.337-1.32.842-1.68L6.331.864z"/><path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1z"/></svg>`,
      },
    ]
  },
  {
    name: 'University',
    apps: [
      {
        name: 'Graduate Employment Survey',
        description: 'Explore GES/ salary statistics for local universities.',
        path: '/ges',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-mortarboard-fill" viewBox="0 0 16 16"><path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z"/><path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466z"/></svg>`,
      },
      {
        name: 'News Management',
        description: 'Upload, analyze, and manage news articles. Used for salary sentiment analysis.',
        path: '/news',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-newspaper" viewBox="0 0 16 16"><path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h11A1.5 1.5 0 0 1 14 2.5v10.528c0 .3-.05.654-.238.972h.738a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 1 1 0v9a1.5 1.5 0 0 1-1.5 1.5H1.497A1.497 1.497 0 0 1 0 13.5z"/><path d="M2 3h10v2H2zm0 3h4v3H2zm0 4h4v1H2zm0 2h4v1H2zm5-6h2v1H7zm3 0h2v1h-2zM7 8h2v1H7zm3 0h2v1h-2zm-3 2h2v1H7zm3 0h2v1h-2z"/></svg>`,
      },
    ],
  },
  {
    name: 'Distance Tracker',
    apps: [
      {
        name: 'Map Viewer',
        description: 'Visualize and track distances on an interactive map.',
        path: '/map',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/></svg>`
      },
    ],
  },
])

function openRoute(path) {
  if (path) router.push(path)
}
</script>
