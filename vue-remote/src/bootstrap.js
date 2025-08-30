import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import './style.css';

const app = createApp(App);

// Make Redux store available globally for cross-micro-frontend communication
app.config.globalProperties.$store = store;

// Expose store globally for Module Federation
if (typeof window !== 'undefined') {
  window.__VUE_REMOTE_STORE__ = store;
}

app.mount('#app');