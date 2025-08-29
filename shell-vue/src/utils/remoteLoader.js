import { defineAsyncComponent, h } from 'vue'
import ErrorBoundary from '../components/ErrorBoundary.vue'

/**
 * Creates a remote component with error boundary and loading states
 * @param {Function} importFn - Dynamic import function for the remote module
 * @param {Object} options - Configuration options
 * @returns {Object} Vue async component
 */
export function createRemoteComponent(importFn, options = {}) {
  const {
    loadingComponent = null,
    errorComponent = ErrorBoundary,
    delay = 200,
    timeout = 10000,
    suspensible = false,
    onError = null
  } = options

  return defineAsyncComponent({
    loader: async () => {
      try {
        console.log(`🔄 Loading remote module...`)
        
        // Start performance timing
        const startTime = performance.now()
        
        // Dynamic import with timeout
        const modulePromise = importFn()
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Remote module loading timeout')), timeout)
        })
        
        const module = await Promise.race([modulePromise, timeoutPromise])
        
        // Log performance metrics
        const loadTime = performance.now() - startTime
        console.log(`✅ Remote module loaded in ${loadTime.toFixed(2)}ms`)
        
        // Handle different module export patterns
        let component = module.default || module
        
        // If the module exports a mount function (for React/Angular integration)
        if (typeof component === 'object' && component.mount) {
          return createWrapperComponent(component)
        }
        
        // If the module exports a Vue component directly
        if (component && (component.render || component.template || component.setup)) {
          return component
        }
        
        // If the module exports a factory function
        if (typeof component === 'function' && !component.render) {
          component = component()
        }
        
        return component || createFallbackComponent('Invalid remote module format')
        
      } catch (error) {
        console.error('❌ Failed to load remote module:', error)
        
        // Custom error handling
        if (onError) {
          onError(error)
        }
        
        // Emit error event for global handling
        const errorEvent = new CustomEvent('remote-error', {
          detail: {
            error: error.message,
            stack: error.stack,
            timestamp: Date.now()
          }
        })
        window.dispatchEvent(errorEvent)
        
        // Return error boundary component
        return createFallbackComponent(error.message)
      }
    },
    
    loadingComponent: loadingComponent || createLoadingComponent(),
    errorComponent: errorComponent,
    delay,
    timeout,
    suspensible
  })
}

/**
 * Creates a wrapper component for non-Vue remotes (React, Angular, etc.)
 * @param {Object} remoteModule - The remote module with mount/unmount functions
 * @returns {Object} Vue wrapper component
 */
function createWrapperComponent(remoteModule) {
  return {
    name: 'RemoteWrapper',
    mounted() {
      if (remoteModule.mount && typeof remoteModule.mount === 'function') {
        try {
          remoteModule.mount(this.$el)
        } catch (error) {
          console.error('Failed to mount remote component:', error)
          this.$el.innerHTML = createErrorTemplate(error.message)
        }
      }
    },
    
    beforeUnmount() {
      if (remoteModule.unmount && typeof remoteModule.unmount === 'function') {
        try {
          remoteModule.unmount(this.$el)
        } catch (error) {
          console.error('Failed to unmount remote component:', error)
        }
      }
    },
    
    render() {
      return h('div', { class: 'remote-wrapper' })
    }
  }
}

/**
 * Creates a loading component
 * @returns {Object} Vue loading component
 */
function createLoadingComponent() {
  return {
    name: 'RemoteLoading',
    template: `
      <div class="remote-loading">
        <div class="loading-spinner"></div>
        <h3>Loading Micro-Frontend...</h3>
        <p>Fetching remote module from container</p>
      </div>
    `,
    style: `
      .remote-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        padding: 2rem;
        text-align: center;
        color: #6b7280;
      }
      
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f4f6;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .remote-loading h3 {
        margin-bottom: 0.5rem;
        font-size: 1.25rem;
        font-weight: 600;
      }
      
      .remote-loading p {
        margin: 0;
        opacity: 0.7;
      }
    `
  }
}

/**
 * Creates a fallback component for errors
 * @param {string} errorMessage - Error message to display
 * @returns {Object} Vue error component
 */
function createFallbackComponent(errorMessage) {
  return {
    name: 'RemoteFallback',
    props: {
      error: {
        type: String,
        default: errorMessage
      }
    },
    template: `
      <div class="remote-fallback">
        <div class="error-icon">⚠️</div>
        <h3>Micro-Frontend Unavailable</h3>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button @click="retry" class="retry-btn">
            🔄 Retry Loading
          </button>
          <button @click="goHome" class="home-btn">
            🏠 Go to Home
          </button>
        </div>
      </div>
    `,
    methods: {
      retry() {
        window.location.reload()
      },
      goHome() {
        this.$router.push('/')
      }
    }
  }
}

/**
 * Creates error template HTML string
 * @param {string} errorMessage - Error message
 * @returns {string} HTML template
 */
function createErrorTemplate(errorMessage) {
  return `
    <div class="remote-fallback" style="
      background: rgba(255, 255, 255, 0.9);
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      margin: 20px;
      color: #374151;
    ">
      <div style="font-size: 3rem; margin-bottom: 16px;">⚠️</div>
      <h3 style="color: #e74c3c; margin-bottom: 16px; font-size: 1.5rem;">
        Micro-Frontend Error
      </h3>
      <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">
        ${errorMessage}
      </p>
      <button onclick="window.location.reload()" style="
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        transition: transform 0.2s ease;
      " onmouseover="this.style.transform='translateY(-2px)'" 
         onmouseout="this.style.transform='translateY(0)'">
        🔄 Retry Loading
      </button>
    </div>
  `
}

/**
 * Preloads remote modules for better performance
 * @param {Array} remoteUrls - Array of remote entry URLs
 * @returns {Promise} Promise that resolves when preloading is complete
 */
export async function preloadRemotes(remoteUrls = []) {
  const defaultRemotes = [
    'http://localhost:3001/remoteEntry.js',
    'http://localhost:3002/remoteEntry.js', 
    'http://localhost:3004/remoteEntry.js',
    'http://localhost:3005/remoteEntry.js',
    'http://localhost:3006/remoteEntry.js'
  ]
  
  const urls = remoteUrls.length > 0 ? remoteUrls : defaultRemotes
  
  console.log('🚀 Preloading remote modules...')
  
  const preloadPromises = urls.map(url => {
    return new Promise((resolve) => {
      const link = document.createElement('link')
      link.rel = 'modulepreload'
      link.href = url
      link.onload = () => {
        console.log(`✅ Preloaded: ${url}`)
        resolve()
      }
      link.onerror = () => {
        console.warn(`⚠️ Failed to preload: ${url}`)
        resolve() // Don't fail the whole process
      }
      document.head.appendChild(link)
    })
  })
  
  await Promise.all(preloadPromises)
  console.log('🎉 Remote preloading complete')
}

/**
 * Health check for remote modules
 * @param {string} remoteName - Name of the remote module
 * @param {string} remoteUrl - URL of the remote entry
 * @returns {Promise<boolean>} Promise that resolves to health status
 */
export async function checkRemoteHealth(remoteName, remoteUrl) {
  try {
    const response = await fetch(remoteUrl, { method: 'HEAD' })
    const isHealthy = response.ok
    
    console.log(`${isHealthy ? '✅' : '❌'} Remote ${remoteName} health: ${response.status}`)
    return isHealthy
  } catch (error) {
    console.error(`❌ Remote ${remoteName} health check failed:`, error.message)
    return false
  }
}