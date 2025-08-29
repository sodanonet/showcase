import { createApp } from 'vue'
import App from './App.vue'
import { setupRouter } from './router'
import { setupErrorHandling } from './utils/errorHandling'

const app = createApp(App)

// Setup router
const router = setupRouter()
app.use(router)

// Setup global error handling
setupErrorHandling(app)

// Mount the application
app.mount('#app')