// Modern ES2022+ JavaScript Remote Entry Point
import './styles/main.css';
import { JSShowcaseApp } from './components/JSShowcaseApp.js';
import { CounterComponent } from './components/CounterComponent.js';
import { DataFetchComponent } from './components/DataFetchComponent.js';
import { ModernAPIDemo } from './components/ModernAPIDemo.js';
import { StateManager } from './utils/StateManager.js';
import { EventBus } from './utils/EventBus.js';

console.log('🚀 JavaScript Remote v2.0 with ES2022+ features loaded!');

// Initialize global utilities
window.jsRemoteState = new StateManager();
window.jsRemoteEvents = new EventBus();

// Auto-mount app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  
  if (appContainer) {
    const app = new JSShowcaseApp();
    app.mount(appContainer);
    
    // Apply global styles if not already applied
    if (!document.body.classList.contains('js-remote-loaded')) {
      document.body.classList.add('js-remote-loaded');
    }
  }
});

// Hot module replacement support
if (module.hot) {
  module.hot.accept();
}