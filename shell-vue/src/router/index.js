import { createRouter, createWebHistory } from 'vue-router'
import { createRemoteComponent } from '../utils/remoteLoader'
import ErrorBoundary from '../components/ErrorBoundary.vue'

// Lazy load remote components with error boundaries
const ReactRemote = createRemoteComponent(() => import('react_remote/ReactModules'))
const VueRemote = createRemoteComponent(() => import('vue_remote/VueModules'))
const AngularRemote = createRemoteComponent(() => import('angular_remote/AngularModules'))
const TypeScriptRemote = createRemoteComponent(() => import('ts_remote/TSModules'))
const JavaScriptRemote = createRemoteComponent(() => import('js_remote/JSModules'))

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => Promise.resolve({ template: '<div></div>' }) // Home content is in App.vue
  },
  {
    path: '/react',
    name: 'ReactRemote',
    component: ReactRemote,
    meta: {
      title: 'React Remote - Modern React 19 Features',
      description: 'Showcasing React 19 with hooks, state management, and component patterns',
      port: '3001'
    }
  },
  {
    path: '/vue',
    name: 'VueRemote',
    component: VueRemote,
    meta: {
      title: 'Vue Remote - Vue 3 Composition API',
      description: 'Demonstrating Vue 3 with Composition API, reactivity, and computed properties',
      port: '3002'
    }
  },
  {
    path: '/angular',
    name: 'AngularRemote',
    component: AngularRemote,
    meta: {
      title: 'Angular Remote - Angular 17 with TypeScript',
      description: 'Angular 17 features with TypeScript, RxJS, reactive forms, and services',
      port: '3004'
    }
  },
  {
    path: '/typescript',
    name: 'TypeScriptRemote',
    component: TypeScriptRemote,
    meta: {
      title: 'TypeScript Remote - Web Components',
      description: 'Web Components with TypeScript 5.3+ advanced features and decorators',
      port: '3005'
    }
  },
  {
    path: '/javascript',
    name: 'JavaScriptRemote',
    component: JavaScriptRemote,
    meta: {
      title: 'JavaScript Remote - ES2022+ Features',
      description: 'Modern ES2022+ features including private fields and advanced APIs',
      port: '3006'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: ErrorBoundary,
    props: {
      error: 'Page not found',
      message: 'The requested page does not exist in this micro-frontend shell.'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  // Update document title based on route meta
  if (to.meta?.title) {
    document.title = to.meta.title
  } else {
    document.title = 'Micro-Frontend Shell - Vue.js Host Application'
  }
  
  // Add loading state
  const loadingEvent = new CustomEvent('navigation-start', {
    detail: { to: to.path, from: from.path }
  })
  window.dispatchEvent(loadingEvent)
  
  next()
})

router.afterEach((to, from) => {
  // Remove loading state
  const loadedEvent = new CustomEvent('navigation-end', {
    detail: { to: to.path, from: from.path }
  })
  window.dispatchEvent(loadedEvent)
  
  // Emit remote loaded event for status tracking
  if (to.path !== '/') {
    setTimeout(() => {
      const remoteLoadedEvent = new CustomEvent('remote-loaded', {
        detail: { path: to.path, timestamp: Date.now() }
      })
      window.dispatchEvent(remoteLoadedEvent)
    }, 100)
  }
})

// Error handling for navigation failures
router.onError((error) => {
  console.error('Router navigation error:', error)
  
  const errorEvent = new CustomEvent('remote-error', {
    detail: {
      path: router.currentRoute.value.path,
      error: error.message,
      timestamp: Date.now()
    }
  })
  window.dispatchEvent(errorEvent)
})

export function setupRouter() {
  return router
}

export { routes }