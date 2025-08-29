/**
 * Global error handling setup for the Vue Shell application
 * Handles errors from Vue components and remote micro-frontends
 */

/**
 * Sets up global error handling for the Vue application
 * @param {Object} app - Vue application instance
 */
export function setupErrorHandling(app) {
  // Vue global error handler
  app.config.errorHandler = (error, instance, info) => {
    console.error('Vue Error:', error)
    console.error('Component Instance:', instance)
    console.error('Error Info:', info)
    
    // Log error to monitoring service (if available)
    logError(error, {
      type: 'vue-error',
      component: instance?.$options.name || 'Unknown',
      info,
      timestamp: Date.now()
    })
    
    // Emit custom error event for UI handling
    const errorEvent = new CustomEvent('shell-error', {
      detail: {
        error: error.message,
        component: instance?.$options.name,
        info,
        timestamp: Date.now()
      }
    })
    window.dispatchEvent(errorEvent)
  }
  
  // Vue warning handler (development only)
  if (process.env.NODE_ENV === 'development') {
    app.config.warnHandler = (msg, instance, trace) => {
      console.warn('Vue Warning:', msg)
      console.warn('Trace:', trace)
    }
  }
  
  // Setup global window error handlers
  setupGlobalErrorHandlers()
  
  // Setup remote error monitoring
  setupRemoteErrorMonitoring()
  
  // Setup performance monitoring
  setupPerformanceMonitoring()
}

/**
 * Sets up global window error handlers
 */
function setupGlobalErrorHandlers() {
  // Global JavaScript error handler
  window.addEventListener('error', (event) => {
    const { message, filename, lineno, colno, error } = event
    
    console.error('Global Error:', {
      message,
      filename,
      lineno,
      colno,
      stack: error?.stack
    })
    
    // Check if error is related to remote module loading
    const isRemoteError = filename?.includes('remoteEntry.js') || 
                         message?.includes('Loading chunk') ||
                         message?.includes('Loading CSS chunk')
    
    logError(error || new Error(message), {
      type: 'global-error',
      isRemoteError,
      filename,
      lineno,
      colno,
      timestamp: Date.now()
    })
    
    // Emit error event
    const errorEvent = new CustomEvent(isRemoteError ? 'remote-error' : 'shell-error', {
      detail: {
        error: message,
        filename,
        lineno,
        colno,
        isRemoteError,
        timestamp: Date.now()
      }
    })
    window.dispatchEvent(errorEvent)
  })
  
  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason)
    
    const isRemoteError = event.reason?.message?.includes('Loading chunk') ||
                         event.reason?.message?.includes('remote') ||
                         event.reason?.stack?.includes('remoteEntry')
    
    logError(event.reason, {
      type: 'unhandled-rejection',
      isRemoteError,
      timestamp: Date.now()
    })
    
    // Emit error event
    const errorEvent = new CustomEvent(isRemoteError ? 'remote-error' : 'shell-error', {
      detail: {
        error: event.reason?.message || 'Unhandled promise rejection',
        isRemoteError,
        timestamp: Date.now()
      }
    })
    window.dispatchEvent(errorEvent)
    
    // Prevent browser default error handling
    event.preventDefault()
  })
  
  // Resource loading error handler
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      const target = event.target
      console.error('Resource Loading Error:', {
        tagName: target.tagName,
        src: target.src || target.href,
        type: target.type
      })
      
      const isRemoteError = (target.src || target.href)?.includes('localhost:300')
      
      logError(new Error(`Failed to load resource: ${target.src || target.href}`), {
        type: 'resource-error',
        tagName: target.tagName,
        src: target.src || target.href,
        isRemoteError,
        timestamp: Date.now()
      })
    }
  }, true)
}

/**
 * Sets up remote micro-frontend error monitoring
 */
function setupRemoteErrorMonitoring() {
  // Listen for remote-specific errors
  window.addEventListener('remote-error', (event) => {
    const { error, path, timestamp } = event.detail
    
    console.error(`🚨 Remote Error on ${path}:`, error)
    
    // Show user-friendly notification
    showErrorNotification(`Micro-frontend error on ${path}`, error)
    
    // Log to monitoring service
    logError(new Error(error), {
      type: 'remote-error',
      path,
      timestamp
    })
  })
  
  // Monitor remote loading timeouts
  const remoteTimeouts = new Map()
  
  window.addEventListener('navigation-start', (event) => {
    const { to } = event.detail
    if (to !== '/') {
      const timeout = setTimeout(() => {
        const timeoutError = new CustomEvent('remote-error', {
          detail: {
            error: 'Remote loading timeout',
            path: to,
            timestamp: Date.now()
          }
        })
        window.dispatchEvent(timeoutError)
      }, 15000) // 15 second timeout
      
      remoteTimeouts.set(to, timeout)
    }
  })
  
  window.addEventListener('navigation-end', (event) => {
    const { to } = event.detail
    const timeout = remoteTimeouts.get(to)
    if (timeout) {
      clearTimeout(timeout)
      remoteTimeouts.delete(to)
    }
  })
}

/**
 * Sets up performance monitoring
 */
function setupPerformanceMonitoring() {
  // Monitor Core Web Vitals
  if ('web-vital' in window) {
    // This would integrate with web-vitals library if available
    console.log('🚀 Performance monitoring enabled')
  }
  
  // Monitor remote loading performance
  window.addEventListener('remote-loaded', (event) => {
    const { path, timestamp } = event.detail
    const navigationStart = performance.timing.navigationStart
    const loadTime = timestamp - navigationStart
    
    console.log(`📊 Remote ${path} loaded in ${loadTime}ms`)
    
    // Log performance metrics
    logPerformanceMetric('remote-load-time', {
      path,
      loadTime,
      timestamp
    })
  })
  
  // Monitor memory usage (if available)
  if ('memory' in performance) {
    setInterval(() => {
      const memoryInfo = performance.memory
      if (memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.8) {
        console.warn('🔥 High memory usage detected:', {
          used: memoryInfo.usedJSHeapSize,
          total: memoryInfo.totalJSHeapSize,
          limit: memoryInfo.jsHeapSizeLimit
        })
      }
    }, 30000) // Check every 30 seconds
  }
}

/**
 * Logs errors to console and external monitoring service
 * @param {Error} error - Error object
 * @param {Object} context - Additional context information
 */
function logError(error, context = {}) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...context
  }
  
  // Log to console
  console.group('🚨 Error Log')
  console.error('Error:', error)
  console.info('Context:', context)
  console.groupEnd()
  
  // Store in sessionStorage for debugging
  try {
    const existingLogs = JSON.parse(sessionStorage.getItem('shell-error-logs') || '[]')
    existingLogs.push(errorData)
    
    // Keep only last 50 errors
    const recentLogs = existingLogs.slice(-50)
    sessionStorage.setItem('shell-error-logs', JSON.stringify(recentLogs))
  } catch (storageError) {
    console.warn('Failed to store error log:', storageError)
  }
  
  // Send to external monitoring service (if configured)
  if (typeof window.errorMonitoringService !== 'undefined') {
    window.errorMonitoringService.logError(errorData)
  }
}

/**
 * Logs performance metrics
 * @param {string} metric - Metric name
 * @param {Object} data - Metric data
 */
function logPerformanceMetric(metric, data) {
  const metricData = {
    metric,
    timestamp: Date.now(),
    url: window.location.href,
    ...data
  }
  
  console.info(`📊 Performance Metric: ${metric}`, data)
  
  // Store in sessionStorage for debugging
  try {
    const existingMetrics = JSON.parse(sessionStorage.getItem('shell-performance-metrics') || '[]')
    existingMetrics.push(metricData)
    
    // Keep only last 100 metrics
    const recentMetrics = existingMetrics.slice(-100)
    sessionStorage.setItem('shell-performance-metrics', JSON.stringify(recentMetrics))
  } catch (storageError) {
    console.warn('Failed to store performance metric:', storageError)
  }
  
  // Send to external monitoring service (if configured)
  if (typeof window.performanceMonitoringService !== 'undefined') {
    window.performanceMonitoringService.logMetric(metricData)
  }
}

/**
 * Shows user-friendly error notification
 * @param {string} title - Notification title
 * @param {string} message - Error message
 */
function showErrorNotification(title, message) {
  // Create and show notification element
  const notification = document.createElement('div')
  notification.className = 'error-notification'
  notification.innerHTML = `
    <div class="error-notification-content">
      <div class="error-icon">⚠️</div>
      <div class="error-text">
        <div class="error-title">${title}</div>
        <div class="error-message">${message}</div>
      </div>
      <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 16px;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease;
  `
  
  // Add CSS animation if not already added
  if (!document.querySelector('#error-notification-styles')) {
    const styles = document.createElement('style')
    styles.id = 'error-notification-styles'
    styles.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .error-notification-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .error-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }
      .error-text {
        flex: 1;
      }
      .error-title {
        font-weight: 600;
        color: #dc2626;
        margin-bottom: 4px;
      }
      .error-message {
        color: #7f1d1d;
        font-size: 0.875rem;
      }
      .error-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        color: #dc2626;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }
      .error-close:hover {
        background: rgba(220, 38, 38, 0.1);
      }
    `
    document.head.appendChild(styles)
  }
  
  document.body.appendChild(notification)
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove()
    }
  }, 10000)
}

/**
 * Gets stored error logs for debugging
 * @returns {Array} Array of error logs
 */
export function getErrorLogs() {
  try {
    return JSON.parse(sessionStorage.getItem('shell-error-logs') || '[]')
  } catch (error) {
    console.warn('Failed to retrieve error logs:', error)
    return []
  }
}

/**
 * Gets stored performance metrics for debugging
 * @returns {Array} Array of performance metrics
 */
export function getPerformanceMetrics() {
  try {
    return JSON.parse(sessionStorage.getItem('shell-performance-metrics') || '[]')
  } catch (error) {
    console.warn('Failed to retrieve performance metrics:', error)
    return []
  }
}

/**
 * Clears stored logs and metrics
 */
export function clearLogs() {
  try {
    sessionStorage.removeItem('shell-error-logs')
    sessionStorage.removeItem('shell-performance-metrics')
    console.log('✅ Logs and metrics cleared')
  } catch (error) {
    console.warn('Failed to clear logs:', error)
  }
}