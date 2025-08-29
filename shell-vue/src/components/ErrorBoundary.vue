<template>
  <div class="error-boundary">
    <div class="error-content">
      <div class="error-icon">
        {{ icon }}
      </div>
      
      <div class="error-details">
        <h2 class="error-title">
          {{ title }}
        </h2>
        
        <p class="error-message">
          {{ message }}
        </p>
        
        <div v-if="showDetails" class="error-stack">
          <details>
            <summary>Technical Details</summary>
            <pre>{{ errorDetails }}</pre>
          </details>
        </div>
        
        <div class="error-actions">
          <button 
            @click="retry" 
            class="action-btn primary-btn"
            :disabled="retrying"
          >
            {{ retrying ? '🔄 Retrying...' : '🔄 Try Again' }}
          </button>
          
          <button 
            @click="goHome" 
            class="action-btn secondary-btn"
          >
            🏠 Go to Home
          </button>
          
          <button 
            @click="reportError" 
            class="action-btn tertiary-btn"
            v-if="canReport"
          >
            📝 Report Issue
          </button>
        </div>
        
        <div class="error-help" v-if="helpText">
          <p>{{ helpText }}</p>
        </div>
      </div>
    </div>
    
    <!-- Development Mode Debug Info -->
    <div v-if="isDevelopment && debugInfo" class="debug-info">
      <h3>Debug Information</h3>
      <div class="debug-grid">
        <div class="debug-item">
          <strong>Timestamp:</strong>
          <span>{{ new Date(debugInfo.timestamp).toLocaleString() }}</span>
        </div>
        <div class="debug-item">
          <strong>Error Type:</strong>
          <span>{{ debugInfo.type || 'Unknown' }}</span>
        </div>
        <div class="debug-item">
          <strong>Component:</strong>
          <span>{{ debugInfo.component || 'N/A' }}</span>
        </div>
        <div class="debug-item">
          <strong>Route:</strong>
          <span>{{ $route.path }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'ErrorBoundary',
  props: {
    error: {
      type: [String, Error],
      default: 'An unexpected error occurred'
    },
    title: {
      type: String,
      default: 'Something went wrong'
    },
    message: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: '⚠️'
    },
    showDetails: {
      type: Boolean,
      default: false
    },
    canReport: {
      type: Boolean,
      default: true
    },
    helpText: {
      type: String,
      default: null
    },
    debugInfo: {
      type: Object,
      default: null
    }
  },
  
  setup(props) {
    const router = useRouter()
    const route = useRoute()
    const retrying = ref(false)
    
    // Computed properties
    const isDevelopment = computed(() => {
      return process.env.NODE_ENV === 'development'
    })
    
    const errorDetails = computed(() => {
      if (props.error instanceof Error) {
        return props.error.stack || props.error.message
      }
      return props.error
    })
    
    const displayMessage = computed(() => {
      if (props.message) {
        return props.message
      }
      
      // Provide user-friendly messages for common errors
      const errorMessage = props.error?.message || props.error
      
      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('Loading chunk')) {
          return 'The micro-frontend failed to load. This might be due to a network issue or the remote service being unavailable.'
        }
        if (errorMessage.includes('timeout')) {
          return 'The micro-frontend took too long to load. Please check your network connection and try again.'
        }
        if (errorMessage.includes('not found') || errorMessage.includes('404')) {
          return 'The requested micro-frontend could not be found. It may have been moved or is temporarily unavailable.'
        }
        if (errorMessage.includes('network')) {
          return 'A network error occurred while loading the micro-frontend. Please check your internet connection.'
        }
      }
      
      return 'An unexpected error occurred while loading this micro-frontend. Please try refreshing the page.'
    })
    
    // Methods
    const retry = async () => {
      retrying.value = true
      
      try {
        // Wait a moment to show the retrying state
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // For remote loading errors, try reloading the current route
        if (route.path !== '/') {
          await router.push('/')
          await router.push(route.path)
        } else {
          window.location.reload()
        }
      } catch (error) {
        console.error('Retry failed:', error)
      } finally {
        retrying.value = false
      }
    }
    
    const goHome = () => {
      router.push('/')
    }
    
    const reportError = () => {
      const errorData = {
        error: props.error?.message || props.error,
        route: route.path,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
      
      // In a real application, this would send the error to a reporting service
      console.log('Error Report:', errorData)
      
      // For now, copy to clipboard
      navigator.clipboard?.writeText(JSON.stringify(errorData, null, 2)).then(() => {
        alert('Error details copied to clipboard')
      }).catch(() => {
        alert(`Error Report:\n\n${JSON.stringify(errorData, null, 2)}`)
      })
    }
    
    // Lifecycle
    onMounted(() => {
      // Log error for debugging
      console.error('ErrorBoundary mounted with error:', props.error)
      
      // Emit error event for analytics
      const errorEvent = new CustomEvent('error-boundary-shown', {
        detail: {
          error: props.error,
          route: route.path,
          timestamp: Date.now()
        }
      })
      window.dispatchEvent(errorEvent)
    })
    
    return {
      retrying,
      isDevelopment,
      errorDetails,
      displayMessage,
      retry,
      goHome,
      reportError
    }
  }
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, #fee2e2 0%, #fef3f2 100%);
  border-radius: 12px;
  margin: 1rem;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
}

.error-content {
  max-width: 600px;
  width: 100%;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #dc2626;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.error-message {
  font-size: 1.125rem;
  color: #7f1d1d;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-stack {
  margin-bottom: 2rem;
  text-align: left;
}

.error-stack details {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.error-stack summary {
  cursor: pointer;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 0.5rem;
}

.error-stack pre {
  background: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-top: 0.5rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.primary-btn {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.primary-btn:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

.secondary-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.secondary-btn:hover {
  background: #e5e7eb;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.tertiary-btn {
  background: transparent;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.tertiary-btn:hover {
  background: #f9fafb;
  color: #374151;
}

.error-help {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 1rem;
  color: #1e40af;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Debug Info Styles */
.debug-info {
  width: 100%;
  max-width: 600px;
  margin-top: 2rem;
  padding: 1.5rem;
  background: #1f2937;
  color: #f9fafb;
  border-radius: 8px;
  text-align: left;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
}

.debug-info h3 {
  color: #fbbf24;
  margin-bottom: 1rem;
  font-size: 1rem;
  text-align: center;
}

.debug-grid {
  display: grid;
  gap: 0.5rem;
}

.debug-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #374151;
}

.debug-item:last-child {
  border-bottom: none;
}

.debug-item strong {
  color: #60a5fa;
}

.debug-item span {
  color: #e5e7eb;
  word-break: break-all;
}

/* Responsive Design */
@media (max-width: 640px) {
  .error-boundary {
    padding: 1rem;
    margin: 0.5rem;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .error-message {
    font-size: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 200px;
  }
  
  .debug-item {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
</style>