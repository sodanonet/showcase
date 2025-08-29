# TypeScript Remote - Web Components Micro-Frontend

A sophisticated TypeScript micro-frontend showcasing modern Web Components with advanced TypeScript features, built for Module Federation.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Lint code
npm run lint
```

## 🏗️ Architecture

This project demonstrates a comprehensive Web Components architecture with:

- **Custom Web Components** with Shadow DOM
- **TypeScript 5.3** with advanced features
- **Module Federation** for micro-frontend integration
- **Custom Decorators** for component registration
- **Modern Browser APIs** integration

## 🧩 Components

### 1. ShowcaseApp (`ts-showcase-app`)
Main application container showcasing all components with:
- Animated component entrance
- Responsive grid layout
- Technology badges
- Modern glassmorphism design

### 2. InteractiveCounter (`ts-interactive-counter`)
Advanced counter component featuring:
- Type-safe state management
- Configurable min/max values and step size
- Smooth animations with `requestAnimationFrame`
- Statistics display (even/odd, absolute value)
- Custom events for value changes

```html
<ts-interactive-counter 
  initial-value="10" 
  step="2" 
  min="0" 
  max="100">
</ts-interactive-counter>
```

### 3. DataGrid (`ts-data-grid`)
Enterprise-level data table with:
- Generic TypeScript interfaces
- Real-time filtering and sorting
- Pagination controls
- Editable cells with validation
- Export functionality (JSON/CSV)

### 4. ChartVisualization (`ts-chart-visualization`)
Dynamic chart component supporting:
- Multiple chart types (Bar, Line, Pie, Doughnut)
- SVG-based rendering with animations
- Interactive data manipulation
- Responsive design
- Real-time data updates

```html
<ts-chart-visualization 
  chart-type="bar" 
  width="600" 
  height="400" 
  animate>
</ts-chart-visualization>
```

### 5. FormValidator (`ts-form-validator`)
Comprehensive form validation featuring:
- Advanced validation rules (regex, custom validators)
- Real-time validation feedback
- Password strength indicator
- Strict/lenient validation modes
- Comprehensive error reporting

```html
<ts-form-validator strict-mode="true"></ts-form-validator>
```

### 6. WebAPIDemo (`ts-web-api-demo`)
Modern Web APIs showcase including:
- **Geolocation API** with high accuracy positioning
- **Network Information API** for connection monitoring
- **Battery Status API** with visual indicators
- **Notification API** with permission handling
- **Clipboard API** with read/write operations
- **Wake Lock API** for screen management
- **Storage APIs** with usage visualization

```html
<ts-web-api-demo auto-update="true" demo-mode="false"></ts-web-api-demo>
```

## 🎯 TypeScript Features Demonstrated

### Custom Decorators
```typescript
@Component('ts-interactive-counter')
@ObservedAttributes(['initial-value', 'step', 'min', 'max'])
export class InteractiveCounter extends BaseWebComponent {
  // Component implementation
}
```

### Advanced Types & Generics
```typescript
interface ValidationRule {
  name: string;
  validator: (value: string) => boolean;
  message: string;
}

interface ChartData<T = number> {
  label: string;
  value: T;
  color: string;
}
```

### Union Types & Literal Types
```typescript
type ChartType = 'bar' | 'line' | 'pie' | 'doughnut';
type ValidationStatus = 'valid' | 'invalid' | 'pending';
```

### Mapped Types & Conditional Types
```typescript
type PartialFormData<T> = {
  [K in keyof T]?: T[K] extends string ? string : never;
};
```

## 🏛️ Base Architecture

### BaseWebComponent
Abstract base class providing:
- Shadow DOM management
- Lifecycle callbacks
- Event handling utilities
- Type-safe attribute helpers
- DOM query shortcuts

```typescript
export abstract class BaseWebComponent extends HTMLElement {
  protected shadow: ShadowRoot;
  
  protected abstract getTemplate(): string;
  protected abstract getStyles(): string;
  
  protected emit(eventName: string, detail?: any): void;
  protected $(selector: string): Element | null;
  protected $$(selector: string): NodeListOf<Element>;
}
```

### Component Registration
Automatic component registration with custom decorators:

```typescript
export function Component(selector: string) {
  return function <T extends CustomElementConstructor>(constructor: T) {
    if (!customElements.get(selector)) {
      customElements.define(selector, constructor);
    }
    return constructor;
  };
}
```

## 📦 Module Federation Configuration

This micro-frontend exposes all components via Module Federation:

```javascript
new ModuleFederationPlugin({
  name: 'tsRemote',
  filename: 'remoteEntry.js',
  exposes: {
    './WebComponents': './src/index.ts',
  },
  shared: {
    // Shared dependencies configuration
  },
})
```

## 🎨 Styling Architecture

- **CSS-in-JS** with template literals
- **Shadow DOM** scoped styles
- **Responsive design** with CSS Grid and Flexbox
- **Modern CSS features** (custom properties, gradients)
- **Glassmorphism effects** with backdrop-filter

## 🔧 Development Features

### Hot Module Replacement
Development server with HMR for rapid iteration:
```bash
npm run dev  # http://localhost:3005
```

### Type Checking
Comprehensive TypeScript configuration:
```bash
npm run type-check  # Verify types
```

### Code Quality
ESLint configuration for TypeScript:
```bash
npm run lint  # Check code quality
```

## 🌐 Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Web Components**: Full support for Custom Elements v1 and Shadow DOM v1
- **TypeScript**: Compiled to ES2020 for optimal performance
- **Module Federation**: Webpack 5 with dynamic imports

## 🔌 Integration

### In Host Applications
```typescript
// Load the remote module
const tsRemote = await import('tsRemote/WebComponents');

// Components are automatically registered and ready to use
document.body.innerHTML = `
  <ts-showcase-app></ts-showcase-app>
`;
```

### Custom Events
All components emit custom events for integration:

```typescript
// Listen to component events
document.addEventListener('valueChange', (event) => {
  console.log('Counter changed:', event.detail);
});

document.addEventListener('formSubmit', (event) => {
  console.log('Form data:', event.detail);
});
```

## 🚀 Performance Features

- **Lazy Loading**: Components loaded on-demand
- **Tree Shaking**: Unused code eliminated in production
- **Code Splitting**: Automatic chunk splitting
- **Shadow DOM**: Isolated styling and DOM manipulation
- **Animation Frame**: Optimized animations with RAF

## 🔍 Advanced Features

### Lifecycle Management
Proper cleanup of resources:
```typescript
protected cleanup(): void {
  if (this.animationFrameId) {
    cancelAnimationFrame(this.animationFrameId);
  }
  // Additional cleanup
}
```

### Type-Safe Events
Custom event system with TypeScript:
```typescript
this.emit('valueChange', { 
  oldValue, 
  newValue, 
  step: this.state.step 
});
```

### Attribute Observation
Reactive attribute changes:
```typescript
protected onAttributeChanged(name: string, oldValue: string, newValue: string): void {
  this.initializeState();
  this.render();
}
```

## 📊 Bundle Analysis

- **Main Bundle**: ~45KB (gzipped)
- **Component Chunks**: 8-15KB each
- **Shared Dependencies**: Optimized sharing via Module Federation
- **TypeScript Output**: ES2020 with decorators support

This TypeScript Remote demonstrates enterprise-grade Web Components architecture with modern TypeScript features, comprehensive browser API integration, and production-ready micro-frontend patterns.