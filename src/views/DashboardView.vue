<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- CONFIGURABLE APP STRUCTURE ---
// You can easily add new groups or new apps here.
const appGroups = ref([
  {
    name: 'Graduate Employment Survey (GES)',
    apps: [
      {
        name: 'Graduate Employment Survey',
        description: 'Explore GES statistics for local universities.',
        path: '/ges',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-mortarboard-fill mb-3" viewBox="0 0 16 16">
          <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z"/>
          <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466z"/>
        </svg>`,
      },
      {
        name: 'News Management',
        description: 'Upload, analyze, and manage news articles. Used for job sentiment analysis.',
        path: '/news',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-newspaper mb-3" viewBox="0 0 16 16">
          <path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h11A1.5 1.5 0 0 1 14 2.5v10.528c0 .3-.05.654-.238.972h.738a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 1 1 0v9a1.5 1.5 0 0 1-1.5 1.5H1.497A1.497 1.497 0 0 1 0 13.5zM12 14c.37 0 .654-.211.853-.441.092-.106.147-.279.147-.531V2.5a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5v11c0 .278.223.5.497.5z"/>
          <path d="M2 3h10v2H2zm0 3h4v3H2zm0 4h4v1H2zm0 2h4v1H2zm5-6h2v1H7zm3 0h2v1h-2zM7 8h2v1H7zm3 0h2v1h-2zm-3 2h2v1H7zm3 0h2v1h-2zm-3 2h2v1H7zm3 0h2v1h-2z"/>
        </svg>`,
      },
      // Example of how to add a new app:
      // {
      //   name: 'User Analytics',
      //   description: 'View user engagement and metrics.',
      //   path: '/analytics',
      //   icon: `<svg>...</svg>`
      // }
    ],
  },
  // Example of how to add a new group:
  // {
  //   name: 'Administrative Tools',
  //   apps: [
  //     {
  //       name: 'Settings',
  //       description: 'Configure application settings.',
  //       path: '/settings',
  //       icon: `<svg>...</svg>`
  //     }
  //   ]
  // }
])

function navigateTo(path) {
  router.push(path)
}
</script>

<template>
  <div class="container py-5">
    <div class="text-center mb-5">
      <h1 class="display-5 fw-bolder">Dashboard</h1>
      <p class="lead fw-normal text-muted-50 mb-0">Select an application to get started.</p>
    </div>

    <div v-for="group in appGroups" :key="group.name" class="mb-5">
      <h2 class="mb-3">{{ group.name }}</h2>
      <div
        class="row gx-4 gx-lg-5 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 justify-content-start"
      >
        <div v-for="app in group.apps" :key="app.name" class="col mb-5">
          <div class="card h-100 shadow-sm app-card" @click="navigateTo(app.path)">
            <div class="card-body p-4 text-center">
              <div v-html="app.icon"></div>
              <h5 class="fw-bolder">{{ app.name }}</h5>
              <p class="text-muted">{{ app.description }}</p>
            </div>
            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent text-center">
              <button class="btn btn-outline-dark mt-auto">Launch</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-card {
  cursor: pointer;
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
}
.app-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}
</style>
