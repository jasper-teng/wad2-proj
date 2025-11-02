import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true } 
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignupView.vue'),
      meta: { guestOnly: true }
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/simple-dashboard',
        name: 'simple-dashboard',
        component: () => import('../views/SimpleDashboardView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/news',
        name: 'news',
        component: () => import('../views/NewsView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/news/:id',
        name: 'news-object',
        component: () => import('../views/NewsObjectView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/ges',
        name: 'ges',
        component: () => import('../views/GESView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/ges/:university/:school/:degree(.*)',
        name: 'ges-object',
        component: () => import('../views/GESObjectView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/map',
        name: 'map',
        component: () => import('../views/MapView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/comparison',
        name: 'comparison',
        component: () => import('../views/ComparisonView.vue'),
    },
    {
        path: '/cca-finder',
        name: 'cca-finder',
        component: () => import('../views/CCAFinderView.vue'),
    },
    {
        path: '/school-comparer',
        name: 'school-comparer',
        component: () => import('../views/SchoolComparerView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/distanceProgramme',
        name: 'distanceProgramme',
        component: () => import('../views/distProg.vue'),
        meta: { requiresAuth: true }
    },
    // Catch-all redirect
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
  ]
})

// Navigation Guard to protect routes
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('authToken');

    if (to.meta.requiresAuth && !isAuthenticated) {
        // If route requires auth and user is not logged in, redirect to login
        next('/login');
    } else if (to.meta.guestOnly && isAuthenticated) {
        // If route is for guests only and user is logged in, redirect to dashboard
        next('/dashboard');
    } else {
        // Otherwise, proceed
        next();
    }
});


export default router

