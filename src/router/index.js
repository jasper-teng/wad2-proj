import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginView, meta: { guestOnly: true } },
    { path: '/signup', component: SignupView, meta: { guestOnly: true } },
    { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
    // Catch all redirect
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

// Navigation Guard to protect routes
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken')

  if (to.meta.requiresAuth && !isAuthenticated) {
    // If route requires auth and user is not logged in, redirect to login
    next('/login')
  } else if (to.meta.guestOnly && isAuthenticated) {
    // If route is for guests only and user is logged in, redirect to dashboard
    next('/dashboard')
  } else {
    // Otherwise, proceed
    next()
  }
})

export default router
