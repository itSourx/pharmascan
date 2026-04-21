import { createRouter, createWebHistory } from 'vue-router'
import MapPage from '../views/MapPage.vue'
import PharmacyManager from '../views/PharmacyManager.vue'
import AuthPage from '../views/AuthPage.vue'
import ForgotPasswordPage from '../views/ForgotPasswordPage.vue'
import TermsPage from '../views/TermsPage.vue'
import PrivacyPage from '../views/PrivacyPage.vue'

const routes = [
  {
    path: '/',
    name: 'Map',
    component: MapPage




















































































































    
  },
  {
    path: '/gestion',
    name: 'PharmacyManager',
    component: PharmacyManager
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthPage
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordPage
  },
  {
    path: '/conditions',
    name: 'Terms',
    component: TermsPage
  },
  {
    path: '/politique',
    name: 'Privacy',
    component: PrivacyPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
