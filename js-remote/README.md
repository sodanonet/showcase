# JavaScript Remote - Modern ES2022+ Micro-Frontend

A comprehensive vanilla JavaScript micro-frontend showcasing modern ES2022+ features, built for Module Federation without any framework dependencies.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## 🏗️ Architecture

This project demonstrates modern JavaScript capabilities with:

- **Pure Vanilla JavaScript** with ES2022+ features
- **Module Federation** for micro-frontend integration
- **Modern Browser APIs** comprehensive integration
- **Custom State Management** and Event System
- **Responsive Design** with CSS Grid and Flexbox

## 🧩 Components

### 1. JSShowcaseApp (`js-showcase-app`)
Main application container demonstrating:
- ES2022 private fields and methods
- Modern class syntax and composition
- Dynamic component mounting and management
- Custom event system with EventBus integration

### 2. CounterComponent
Advanced counter with modern JavaScript features:
- Private fields for encapsulation (`#value`, `#step`)
- Async/await for smooth animations
- Event-driven architecture
- Type checking and validation
- Public API with getters/setters

```javascript
const counter = new CounterComponent({
  initialValue: 10,
  step: 2,
  min: 0,
  max: 100,
  onUpdate: (value) => console.log('New value:', value)
});
```

### 3. DataFetchComponent
Modern async data fetching with:
- Fetch API with AbortController for cancellation
- Promise-based data loading
- Cache management with TTL
- Error handling and retry logic
- Batch operations and middleware

```javascript
const dataFetch = new DataFetchComponent({
  apiUrl: 'https://jsonplaceholder.typicode.com/users',
  onDataLoad: (data) => console.log('Loaded:', data.length, 'items')
});
```

### 4. ModernAPIDemo
Browser APIs demonstration including:
- **Geolocation API** with high accuracy positioning
- **Notification API** with permission handling
- **Clipboard API** for read/write operations
- **Battery Status API** with event listeners
- **Vibration API** with custom patterns
- **Web Share API** for native sharing
- **Wake Lock API** for screen management
- **Fullscreen API** with auto-exit demo

### 5. WeatherWidget
Real-time weather component featuring:
- Async API integration with simulated data
- Geolocation-based weather detection
- Search functionality with modal overlay
- Error handling and loading states
- Responsive design with CSS Grid

## 🎯 Modern JavaScript Features Demonstrated

### ES2022+ Language Features

#### Private Fields and Methods
```javascript
class Component {
  // Private fields
  #state = new Map();
  #listeners = new Set();
  
  // Private methods
  #updateState(newState) {
    this.#state.set('data', newState);
  }
}
```

#### Async/Await and Promise Patterns
```javascript
async #fetchData() {
  try {
    const response = await fetch(this.apiUrl, {
      signal: this.#abortController.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    this.#handleError(error);
  }
}
```

#### Optional Chaining and Nullish Coalescing
```javascript
const userData = {
  profile: response?.data?.profile ?? {},
  settings: user?.preferences?.settings || defaultSettings,
  lastLogin: user?.activity?.lastLogin?.timestamp ?? Date.now()
};
```

#### Destructuring and Default Parameters
```javascript
constructor({ 
  initialValue = 0, 
  step = 1, 
  min = null, 
  max = null,
  onUpdate = null 
} = {}) {
  this.#initializeState({ initialValue, step, min, max });
}
```

#### Template Literals and Tagged Templates
```javascript
const template = `
  <div class="component ${this.#getClassName()}">
    <h3>${this.title}</h3>
    ${this.#renderContent()}
  </div>
`;
```

#### Map/Set Collections and Iterators
```javascript
// Using Map for component registry
#components = new Map([
  ['counter', CounterComponent],
  ['dataFetch', DataFetchComponent]
]);

// Using Set for unique listeners
#eventListeners = new Set();

// Modern iteration
for (const [name, Component] of this.#components) {
  instances.set(name, new Component(options));
}
```

## 🔧 Utility Classes

### StateManager
Advanced state management with:
- Reactive subscriptions
- Computed values
- Middleware support
- History tracking with undo/redo
- Persistence with localStorage sync
- Batch operations for performance

```javascript
const state = new StateManager({ count: 0 });

// Reactive subscriptions
const unsubscribe = state.subscribe('count', (newValue, oldValue) => {
  console.log(`Count changed: ${oldValue} → ${newValue}`);
});

// Computed values
const cleanup = state.computed('isEven', 
  (snapshot) => snapshot.get('count') % 2 === 0,
  ['count']
);

// Middleware for logging
state.use((operation, payload) => {
  console.log('State operation:', operation, payload);
  return payload;
});
```

### EventBus
Modern event system featuring:
- Priority-based listeners
- Async event emission
- Middleware for event processing
- Namespaced events
- Wildcard listeners
- Event history and debugging
- AbortController integration

```javascript
const eventBus = new EventBus();

// Priority listeners
eventBus.on('user:action', handler1, { priority: 10 });
eventBus.on('user:action', handler2, { priority: 5 });

// Async events
const result = await eventBus.emitAsync('data:process', data);

// Conditional listening
eventBus.when('user:click', 
  (target) => target.classList.contains('button'),
  handleButtonClick
);

// Event composition
eventBus.pipe('raw:data', 'processed:data', 
  (data) => ({ ...data, processed: true })
);
```

## 📦 Module Federation Configuration

Exposes components and utilities via Module Federation:

```javascript
new ModuleFederationPlugin({
  name: 'js_remote',
  filename: 'remoteEntry.js',
  exposes: {
    './JSModules': './src/index.js',
  },
  shared: {},
})
```

## 🎨 Styling Architecture

- **CSS Custom Properties** for consistent theming
- **CSS Grid and Flexbox** for responsive layouts
- **CSS Animations** with modern performance optimizations
- **Glassmorphism Effects** with backdrop-filter
- **Mobile-First Design** with progressive enhancement

```css
:root {
  --primary-gradient: linear-gradient(135deg, #f093fb, #f5576c);
  --secondary-gradient: linear-gradient(135deg, #4facfe, #00f2fe);
  --glass-bg: rgba(255, 255, 255, 0.1);
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 🌐 Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **ES2022 Features**: Private fields, top-level await, class static blocks
- **Modern Web APIs**: Fetch, AbortController, Intersection Observer
- **Module Federation**: Webpack 5 with dynamic imports

## 🔌 Integration Examples

### In Host Applications
```javascript
// Dynamic import
const jsRemote = await import('js_remote/JSModules');

// Mount full application
const app = jsRemote.createApp();
await app.mount(document.getElementById('js-remote-container'));

// Mount individual components
const counter = jsRemote.createCounter({ 
  initialValue: 5,
  onUpdate: (value) => updateGlobalState('count', value)
});
await counter.mount(document.getElementById('counter-widget'));
```

### Using Factory Methods
```javascript
// Easy instantiation
const components = {
  weather: jsRemote.createWeather({ defaultLocation: 'London' }),
  dataFetch: jsRemote.createDataFetch({ 
    apiUrl: 'https://api.example.com/data' 
  }),
  state: jsRemote.createStateManager({ theme: 'dark' }),
  events: jsRemote.createEventBus()
};

// Mount utility
await jsRemote.mount('#app', 'app', { theme: 'dark' });
```

## 🚀 Performance Features

- **Dynamic Imports** for code splitting
- **Async Component Loading** with lazy initialization
- **Event Delegation** for efficient DOM handling
- **RequestAnimationFrame** for smooth animations
- **AbortController** for cancellable operations
- **Memory Management** with cleanup methods

## 🧪 Advanced Features

### Error Boundaries
```javascript
class ComponentWithErrorHandling {
  #setupGlobalErrorHandling() {
    window.addEventListener('error', this.#handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.#handlePromiseRejection.bind(this));
  }
}
```

### Performance Monitoring
```javascript
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Performance metric:', entry.name, entry.duration);
  }
});
performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
```

### Service Worker Integration
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => console.log('SW registered'))
    .catch(error => console.log('SW registration failed'));
}
```

## 📊 Bundle Analysis

- **Main Bundle**: ~35KB (gzipped)
- **Component Chunks**: 8-15KB each
- **Zero Dependencies**: Pure vanilla JavaScript
- **Tree Shaking**: Optimized for minimal bundle size

This JavaScript Remote showcases the power and elegance of modern vanilla JavaScript, demonstrating that complex, feature-rich applications can be built without framework dependencies while maintaining excellent performance and developer experience.