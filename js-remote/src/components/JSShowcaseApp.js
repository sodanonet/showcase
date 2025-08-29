// Modern JavaScript Showcase Application using ES2022+ features
import { CounterComponent } from './CounterComponent.js';
import { DataFetchComponent } from './DataFetchComponent.js';
import { ModernAPIDemo } from './ModernAPIDemo.js';
import { WeatherWidget } from './WeatherWidget.js';

export class JSShowcaseApp {
  // Private fields using ES2022 private field syntax
  #container = null;
  #components = new Map();
  #abortController = null;
  #state = {
    theme: 'default',
    loaded: false,
    error: null
  };

  // Modern JavaScript features demonstrated
  #features = [
    'ES2022 Private Fields',
    'Classes & Modules',
    'Async/Await',
    'Destructuring',
    'Template Literals',
    'Arrow Functions',
    'Map/Set Collections',
    'Proxy & Reflect',
    'Async Iterators',
    'Top-level await',
    'Optional Chaining',
    'Nullish Coalescing'
  ];

  constructor(options = {}) {
    this.#state = { ...this.#state, ...options };
    this.#initializeComponents();
  }

  // Private method using ES2022 syntax
  #initializeComponents() {
    // Using modern Map for component management
    this.#components.set('counter', new CounterComponent({
      initialValue: 0,
      step: 1,
      onUpdate: (value) => this.#handleCounterUpdate(value)
    }));

    this.#components.set('dataFetch', new DataFetchComponent({
      apiUrl: 'https://jsonplaceholder.typicode.com/users',
      onDataLoad: (data) => this.#handleDataLoad(data)
    }));

    this.#components.set('apiDemo', new ModernAPIDemo({
      onFeatureTest: (feature, result) => this.#handleFeatureTest(feature, result)
    }));

    this.#components.set('weather', new WeatherWidget({
      defaultLocation: 'New York',
      onLocationChange: (location) => this.#handleLocationChange(location)
    }));
  }

  // Event handlers using private methods
  #handleCounterUpdate(value) {
    console.log(`Counter updated to: ${value}`);
    
    // Demonstrate modern event dispatch
    this.#dispatchCustomEvent('counterUpdate', { value, timestamp: Date.now() });
  }

  #handleDataLoad(data) {
    console.log('Data loaded:', data?.length ?? 0, 'items');
    
    // Using optional chaining and nullish coalescing
    const count = data?.length ?? 0;
    this.#dispatchCustomEvent('dataLoad', { count, data: data ?? [] });
  }

  #handleFeatureTest(feature, result) {
    console.log(`Feature test - ${feature}:`, result);
  }

  #handleLocationChange(location) {
    console.log(`Weather location changed to: ${location}`);
  }

  // Modern event dispatch with custom events
  #dispatchCustomEvent(eventName, detail) {
    const event = new CustomEvent(`jsRemote:${eventName}`, {
      detail,
      bubbles: true,
      composed: true
    });
    
    this.#container?.dispatchEvent(event);
  }

  // Public method to mount the application
  async mount(container) {
    if (!container) {
      throw new Error('Container element is required');
    }

    this.#container = container;
    
    try {
      await this.#render();
      this.#setupEventListeners();
      this.#state.loaded = true;
      
      console.log('🚀 JavaScript Remote App mounted successfully!');
    } catch (error) {
      this.#state.error = error;
      this.#renderError();
    }
  }

  // Async render method with template literals and modern features
  async #render() {
    // Using template literals with embedded expressions
    const template = `
      <div class="js-showcase">
        <div class="showcase-header">
          <h2>🚀 Modern JavaScript Remote</h2>
          <p>Showcasing ES2022+ features in a micro-frontend architecture</p>
          <div class="tech-badges">
            ${this.#features.map(feature => `
              <span class="tech-badge">${feature}</span>
            `).join('')}
          </div>
        </div>

        <div class="components-grid">
          <!-- Counter Component -->
          <div class="component-card" data-component="counter">
            <h3 class="component-title">
              🔢 Interactive Counter
            </h3>
            <p class="component-description">
              Modern JavaScript counter with ES2022 private fields and class features.
            </p>
            <div id="counter-mount"></div>
          </div>

          <!-- Data Fetch Component -->
          <div class="component-card" data-component="dataFetch">
            <h3 class="component-title">
              🌐 Async Data Fetcher
            </h3>
            <p class="component-description">
              Demonstrates modern async/await, fetch API, and error handling patterns.
            </p>
            <div id="data-fetch-mount"></div>
          </div>

          <!-- Modern API Demo -->
          <div class="component-card" data-component="apiDemo">
            <h3 class="component-title">
              ⚡ Browser APIs Demo
            </h3>
            <p class="component-description">
              Showcasing modern Web APIs with JavaScript and feature detection.
            </p>
            <div id="api-demo-mount"></div>
          </div>

          <!-- Weather Widget -->
          <div class="component-card" data-component="weather">
            <h3 class="component-title">
              🌤️ Weather Widget
            </h3>
            <p class="component-description">
              Real-time weather data with geolocation and external API integration.
            </p>
            <div id="weather-mount"></div>
          </div>
        </div>

        <!-- JavaScript Features Demonstration -->
        <div class="component-card">
          <h3 class="component-title">
            📋 Modern JavaScript Features
          </h3>
          <p class="component-description">
            Interactive demonstration of ES2022+ language features and APIs.
          </p>
          <div id="features-demo"></div>
        </div>

        <!-- State and Event System Demo -->
        <div class="component-card">
          <h3 class="component-title">
            🔄 State & Event System
          </h3>
          <p class="component-description">
            Custom state management and event system using modern JavaScript patterns.
          </p>
          <div id="state-demo"></div>
        </div>
      </div>
    `;

    this.#container.innerHTML = template;

    // Mount individual components asynchronously
    await this.#mountComponents();
    await this.#renderFeaturesDemo();
    await this.#renderStateDemo();
  }

  // Mount components with error handling
  async #mountComponents() {
    const mountPromises = Array.from(this.#components.entries()).map(
      async ([name, component]) => {
        try {
          const mountPoint = this.#container.querySelector(`#${this.#getMountId(name)}`);
          if (mountPoint && typeof component.mount === 'function') {
            await component.mount(mountPoint);
          }
        } catch (error) {
          console.error(`Failed to mount ${name} component:`, error);
        }
      }
    );

    await Promise.allSettled(mountPromises);
  }

  #getMountId(componentName) {
    const mountIds = {
      counter: 'counter-mount',
      dataFetch: 'data-fetch-mount',
      apiDemo: 'api-demo-mount',
      weather: 'weather-mount'
    };
    
    return mountIds[componentName] ?? `${componentName}-mount`;
  }

  // Demonstrate modern JavaScript features interactively
  async #renderFeaturesDemo() {
    const container = this.#container.querySelector('#features-demo');
    if (!container) return;

    // Using destructuring and modern array methods
    const features = [
      {
        name: 'Optional Chaining',
        example: 'obj?.property?.method?.()',
        demo: () => {
          const obj = { nested: { value: 42 } };
          return obj?.nested?.value ?? 'undefined';
        }
      },
      {
        name: 'Nullish Coalescing',
        example: 'value ?? defaultValue',
        demo: () => {
          const value = null;
          return value ?? 'default';
        }
      },
      {
        name: 'Private Fields',
        example: 'class { #private = "value" }',
        demo: () => {
          return typeof this.#state;
        }
      },
      {
        name: 'BigInt',
        example: '123456789012345678901234567890n',
        demo: () => {
          return (BigInt(Number.MAX_SAFE_INTEGER) + 1n).toString();
        }
      }
    ];

    const featuresHTML = features.map((feature, index) => `
      <div class="api-item" onclick="window.jsShowcase?.demonstrateFeature(${index})">
        <div class="api-icon">⚡</div>
        <div class="api-name">${feature.name}</div>
        <code style="font-size: 0.8rem; color: #4facfe;">${feature.example}</code>
        <div class="api-status supported" id="feature-result-${index}">
          Click to demo
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="api-grid">
        ${featuresHTML}
      </div>
    `;

    // Expose demo function globally for onclick handlers
    window.jsShowcase = {
      demonstrateFeature: (index) => {
        const feature = features[index];
        const result = feature.demo();
        const resultElement = this.#container.querySelector(`#feature-result-${index}`);
        if (resultElement) {
          resultElement.textContent = `Result: ${result}`;
          resultElement.classList.add('pulse');
          setTimeout(() => resultElement.classList.remove('pulse'), 1000);
        }
      }
    };
  }

  // Demonstrate state management and events
  async #renderStateDemo() {
    const container = this.#container.querySelector('#state-demo');
    if (!container) return;

    container.innerHTML = `
      <div class="data-container">
        <div class="data-item">
          <span class="data-label">Application State:</span>
          <span class="data-value">${this.#state.loaded ? 'Loaded' : 'Loading'}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Components Count:</span>
          <span class="data-value">${this.#components.size}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Theme:</span>
          <span class="data-value">${this.#state.theme}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Error State:</span>
          <span class="data-value">${this.#state.error ? 'Error' : 'None'}</span>
        </div>
      </div>
      
      <div style="margin-top: 20px;">
        <button class="btn btn-secondary btn-small" onclick="window.jsShowcase?.updateTheme()">
          🎨 Toggle Theme
        </button>
        <button class="btn btn-secondary btn-small" onclick="window.jsShowcase?.triggerEvent()">
          📡 Trigger Event
        </button>
      </div>
    `;

    // Extend global showcase object
    Object.assign(window.jsShowcase, {
      updateTheme: () => {
        this.#state.theme = this.#state.theme === 'default' ? 'dark' : 'default';
        this.#renderStateDemo();
        this.#dispatchCustomEvent('themeChange', { theme: this.#state.theme });
      },
      triggerEvent: () => {
        this.#dispatchCustomEvent('customEvent', { 
          message: 'Hello from JavaScript Remote!',
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  #setupEventListeners() {
    // Listen for custom events from components
    this.#container.addEventListener('jsRemote:counterUpdate', (event) => {
      console.log('Received counter update:', event.detail);
    });

    this.#container.addEventListener('jsRemote:dataLoad', (event) => {
      console.log('Received data load event:', event.detail);
    });

    // Demonstrate modern event handling with AbortController
    const controller = new AbortController();
    
    this.#container.addEventListener('jsRemote:customEvent', (event) => {
      console.log('Custom event received:', event.detail);
      
      // Show temporary notification
      this.#showNotification('Event triggered successfully!', 'success');
    }, { signal: controller.signal });

    // Store controller for cleanup
    this.#abortController = controller;
  }

  #showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `status ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      animation: fadeInUp 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeInUp 0.3s ease reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  #renderError() {
    if (!this.#container) return;
    
    this.#container.innerHTML = `
      <div class="component-card">
        <h3 class="component-title">❌ Application Error</h3>
        <div class="status error">
          ${this.#state.error?.message ?? 'An unknown error occurred'}
        </div>
        <button class="btn" onclick="location.reload()">
          🔄 Reload Application
        </button>
      </div>
    `;
  }

  // Public method to get application state
  getState() {
    return { ...this.#state };
  }

  // Public method to update state
  updateState(newState) {
    this.#state = { ...this.#state, ...newState };
    
    // Re-render state demo if mounted
    if (this.#container?.querySelector('#state-demo')) {
      this.#renderStateDemo();
    }
  }

  // Cleanup method
  destroy() {
    // Clean up event listeners
    this.#abortController?.abort();
    
    // Cleanup components
    this.#components.forEach(component => {
      if (typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    
    // Clear container
    if (this.#container) {
      this.#container.innerHTML = '';
      this.#container = null;
    }
    
    // Clear global reference
    delete window.jsShowcase;
    
    console.log('🧹 JavaScript Remote App cleaned up');
  }
}