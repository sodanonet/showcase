# Vue Remote Micro-Frontend

A Vue 3 micro-frontend application built with Webpack Module Federation, showcasing modern Vue development practices and micro-frontend architecture.

## 🚀 Features

- **Vue 3 with Composition API**: Modern reactive programming with setup()
- **Module Federation**: Exposes Vue components as micro-frontend modules
- **Standalone Mode**: Can run independently for development and testing
- **Interactive Components**: Counter, Todo list, and feature demonstrations
- **Modern Styling**: CSS3 with gradients, animations, and glass-morphism effects
- **Mobile Responsive**: Optimized for all device sizes
- **Hot Module Replacement**: Fast development experience

## 🛠️ Tech Stack

- Vue 3.5+
- Composition API
- Webpack 5 with Module Federation
- JavaScript ES6+
- CSS3 with modern features
- Babel for transpilation

## 📦 Installation

```bash
cd vue-remote
npm install
```

## 🚀 Development

Start the development server:

```bash
npm run dev
```

The application will be available at: http://localhost:3002

## 🏗️ Build

Build for production:

```bash
npm run build
```

## 🔗 Module Federation

This application exposes the following modules:

- **Module Name**: `vue_remote`
- **Remote Entry**: `remoteEntry.js`  
- **Port**: 3002
- **Exposed Components**:
  - `./App` - Main Vue application component

### Integration Example

To consume this micro-frontend in a shell application:

```javascript
// webpack.config.js in shell application
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    vue_remote: 'vue_remote@http://localhost:3002/remoteEntry.js',
  },
});

// In your shell component (React example)
const VueRemoteApp = React.lazy(() => import('vue_remote/App'));

function ShellApp() {
  return (
    <Suspense fallback={<div>Loading Vue Remote...</div>}>
      <VueRemoteApp />
    </Suspense>
  );
}
```

## 📁 Project Structure

```
src/
├── components/
│   └── VueRemoteApp.vue     # Main component with all demos
├── App.vue                  # App wrapper component
├── bootstrap.js             # Application bootstrap
├── main.js                  # Entry point with dynamic import
└── style.css               # Global styles
public/
└── index.html              # HTML template
webpack.config.js           # Webpack & Module Federation config
```

## 🎯 Component Features

### Counter Demo
- Increment/decrement functionality
- Smooth button animations
- Vue reactivity demonstration

### Todo List Demo
- Add new todos with Enter key support
- Toggle completion status
- Delete individual todos
- Real-time statistics (total, completed, remaining)
- Input validation

### Vue 3 Features Showcase
- **Composition API**: Modern reactive programming
- **Computed Properties**: Reactive calculations
- **Template Syntax**: Declarative rendering
- **Event Handling**: User interaction management

## 🎨 Styling Features

- **Modern Design**: Glass-morphism effects with backdrop blur
- **Gradient Backgrounds**: Smooth color transitions
- **Hover Effects**: Interactive visual feedback
- **Responsive Grid**: Adaptive feature cards layout
- **Smooth Animations**: CSS transitions for all interactions

## 🧪 Vue 3 Concepts Demonstrated

### Composition API Usage
```javascript
import { ref, computed } from 'vue';

export default {
  setup() {
    const counter = ref(0);
    const todos = ref([]);
    
    const completedCount = computed(() => {
      return todos.value.filter(todo => todo.completed).length;
    });
    
    return { counter, todos, completedCount };
  }
};
```

### Reactive Data
- `ref()` for primitive reactive values
- `computed()` for derived state
- Template reactivity with v-model

### Component Communication
- Props and emits pattern
- Event handling with `@click`, `@keyup`
- Two-way binding with `v-model`

## 📈 Performance Features

- **Code Splitting**: Webpack chunks for optimal loading
- **Shared Dependencies**: Vue shared across micro-frontends
- **Tree Shaking**: Unused code elimination
- **Minification**: Optimized production builds
- **Dynamic Imports**: Lazy loading capabilities

## 🔧 Configuration

### Webpack Configuration Highlights
- **Module Federation Plugin**: Micro-frontend setup
- **Vue Loader**: Single File Component support
- **Babel Integration**: ES6+ transpilation
- **Development Server**: Hot reloading with port 3002

### Development Server Features
- Hot Module Replacement
- History API fallback for SPA routing
- Static file serving
- Proxy support ready

## 🌟 Showcase Purpose

This project demonstrates:

**Vue.js Expertise:**
- Vue 3 Composition API mastery
- Single File Component architecture
- Reactive data management
- Template syntax and directives

**Modern JavaScript:**
- ES6+ features usage
- Module system understanding
- Async/await patterns
- Destructuring and spread operators

**Micro-Frontend Architecture:**
- Module Federation implementation
- Independent deployment capability
- Shared dependency management
- Cross-framework integration ready

**Frontend Development Skills:**
- Component-based architecture
- State management patterns
- Event handling and user interaction
- Responsive design principles
- CSS animations and transitions

## 🚀 Integration Ready

This Vue Remote is designed to integrate seamlessly with:
- React shell applications
- Angular host applications  
- Vue-based shell applications
- Vanilla JavaScript containers
- Any Module Federation compatible host

The component is self-contained with its own styling and state management, making it perfect for demonstrating micro-frontend architecture and Vue.js development skills.