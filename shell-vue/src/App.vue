<template>
  <div id="app">
    <!-- Navigation Header -->
    <header class="shell-header">
      <div class="shell-nav-container">
        <div class="shell-logo">
          <h1>🏗️ Micro-Frontend Showcase</h1>
          <p>Vue.js Shell Application</p>
        </div>
        
        <nav class="shell-nav">
          <router-link 
            v-for="route in routes" 
            :key="route.path"
            :to="route.path" 
            class="shell-nav-link"
            :class="{ active: $route.path === route.path }"
          >
            <span class="nav-icon">{{ route.icon }}</span>
            <span class="nav-text">{{ route.name }}</span>
          </router-link>
        </nav>
        
        <div class="shell-status">
          <div class="status-indicator" :class="{ online: allRemotesLoaded }">
            {{ allRemotesLoaded ? '✅ All Remotes' : '⏳ Loading...' }}
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="shell-main">
      <div class="shell-content">
        <!-- Home Page -->
        <div v-if="$route.path === '/'" class="home-page">
          <div class="hero-section">
            <h2>Welcome to the Micro-Frontend Showcase</h2>
            <p>This Vue.js shell application demonstrates Module Federation by consuming micro-frontends built with different technologies:</p>
            
            <div class="tech-grid">
              <div class="tech-card" v-for="tech in technologies" :key="tech.name">
                <div class="tech-icon">{{ tech.icon }}</div>
                <h3>{{ tech.name }}</h3>
                <p>{{ tech.description }}</p>
                <router-link :to="tech.route" class="tech-link">
                  View {{ tech.name }} Remote →
                </router-link>
              </div>
            </div>
          </div>
          
          <div class="features-section">
            <h3>🚀 Architecture Features</h3>
            <div class="features-grid">
              <div class="feature-item">
                <h4>Module Federation</h4>
                <p>Webpack 5 Module Federation enables runtime code sharing between applications</p>
              </div>
              <div class="feature-item">
                <h4>Technology Diversity</h4>
                <p>Each micro-frontend uses different frameworks and modern language features</p>
              </div>
              <div class="feature-item">
                <h4>Independent Deployment</h4>
                <p>Each remote can be developed, built, and deployed independently</p>
              </div>
              <div class="feature-item">
                <h4>Error Boundaries</h4>
                <p>Graceful fallbacks when individual micro-frontends fail to load</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Remote Micro-Frontend Container -->
        <div v-else class="remote-container">
          <div class="remote-header">
            <h2>{{ currentRemoteName }}</h2>
            <div class="remote-info">
              <span class="port-info">Port: {{ currentRemotePort }}</span>
              <div class="load-status" :class="{ loaded: remoteStatus[currentRemotePath] }">
                {{ remoteStatus[currentRemotePath] ? '✅ Loaded' : '⏳ Loading...' }}
              </div>
            </div>
          </div>
          
          <div class="remote-content">
            <router-view />
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="shell-footer">
      <p>Built with Vue 3, Webpack 5 Module Federation | 
         <a href="https://github.com/anthropics/claude-code" target="_blank">🤖 Generated with Claude Code</a>
      </p>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const route = useRoute()
    
    // Application state
    const remoteStatus = ref({
      '/react': false,
      '/vue': false,
      '/angular': false,
      '/typescript': false,
      '/javascript': false
    })
    
    // Navigation routes
    const routes = [
      { path: '/', name: 'Home', icon: '🏠' },
      { path: '/react', name: 'React', icon: '⚛️' },
      { path: '/vue', name: 'Vue', icon: '💚' },
      { path: '/angular', name: 'Angular', icon: '🅰️' },
      { path: '/typescript', name: 'TypeScript', icon: '🔷' },
      { path: '/javascript', name: 'JavaScript', icon: '💛' }
    ]
    
    // Technology information
    const technologies = [
      {
        name: 'React',
        icon: '⚛️',
        description: 'React 19 with modern hooks, state management, and component patterns',
        route: '/react'
      },
      {
        name: 'Vue',
        icon: '💚',
        description: 'Vue 3 with Composition API, reactivity, and computed properties',
        route: '/vue'
      },
      {
        name: 'Angular',
        icon: '🅰️',
        description: 'Angular 17 with TypeScript, RxJS, reactive forms, and services',
        route: '/angular'
      },
      {
        name: 'TypeScript',
        icon: '🔷',
        description: 'Web Components with TypeScript 5.3+ advanced features and decorators',
        route: '/typescript'
      },
      {
        name: 'JavaScript',
        icon: '💛',
        description: 'Modern ES2022+ features including private fields and advanced APIs',
        route: '/javascript'
      }
    ]
    
    // Computed properties
    const allRemotesLoaded = computed(() => 
      Object.values(remoteStatus.value).every(status => status)
    )
    
    const currentRemotePath = computed(() => route.path)
    
    const currentRemoteName = computed(() => {
      const routeData = routes.find(r => r.path === route.path)
      return routeData ? routeData.name : 'Remote'
    })
    
    const currentRemotePort = computed(() => {
      const portMap = {
        '/react': '3001',
        '/vue': '3002',
        '/angular': '3004',
        '/typescript': '3005',
        '/javascript': '3006'
      }
      return portMap[route.path] || 'N/A'
    })
    
    // Methods
    const updateRemoteStatus = (path, status) => {
      remoteStatus.value[path] = status
    }
    
    // Lifecycle
    onMounted(() => {
      // Listen for remote loading events
      window.addEventListener('remote-loaded', (event) => {
        updateRemoteStatus(event.detail.path, true)
      })
      
      // Listen for remote loading errors
      window.addEventListener('remote-error', (event) => {
        console.error('Remote loading error:', event.detail)
        updateRemoteStatus(event.detail.path, false)
      })
    })
    
    return {
      routes,
      technologies,
      remoteStatus,
      allRemotesLoaded,
      currentRemotePath,
      currentRemoteName,
      currentRemotePort,
      updateRemoteStatus
    }
  }
}
</script>

<style scoped>
/* Shell Application Styles */
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Header Styles */
.shell-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.shell-nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.shell-logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #667eea;
}

.shell-logo p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

/* Navigation Styles */
.shell-nav {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.shell-nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #6b7280;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.875rem;
}

.shell-nav-link:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: translateY(-1px);
}

.shell-nav-link.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.nav-icon {
  font-size: 1.125rem;
}

.nav-text {
  font-weight: 500;
}

/* Status Indicator */
.shell-status {
  display: flex;
  align-items: center;
}

.status-indicator {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  transition: all 0.3s ease;
}

.status-indicator.online {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

/* Main Content */
.shell-main {
  flex: 1;
  padding: 2rem 0;
}

.shell-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Home Page Styles */
.home-page {
  color: white;
}

.hero-section {
  text-align: center;
  margin-bottom: 4rem;
}

.hero-section h2 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-section p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

/* Technology Grid */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.tech-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  color: #2c3e50;
}

.tech-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.tech-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.tech-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.tech-card p {
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.tech-link {
  display: inline-block;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: transform 0.2s ease;
}

.tech-link:hover {
  transform: translateY(-2px);
}

/* Features Section */
.features-section {
  margin-top: 4rem;
  text-align: center;
}

.features-section h3 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-item h4 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: white;
}

.feature-item p {
  opacity: 0.9;
  line-height: 1.5;
}

/* Remote Container */
.remote-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: 600px;
}

.remote-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remote-header h2 {
  font-size: 1.75rem;
  margin: 0;
}

.remote-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
}

.port-info {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.load-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.load-status.loaded {
  background: rgba(16, 185, 129, 0.2);
}

.remote-content {
  padding: 2rem;
  min-height: 500px;
}

/* Footer */
.shell-footer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 0;
  text-align: center;
  color: #6b7280;
}

.shell-footer a {
  color: #667eea;
  text-decoration: none;
}

.shell-footer a:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
  .shell-nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .shell-nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .hero-section h2 {
    font-size: 2rem;
  }
  
  .tech-grid {
    grid-template-columns: 1fr;
  }
  
  .remote-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>