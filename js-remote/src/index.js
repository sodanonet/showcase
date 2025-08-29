// JavaScript Remote - Main Export Module for Module Federation
// This file exports all the main components and utilities for consumption by host applications

// Main Application Component
export { JSShowcaseApp } from './components/JSShowcaseApp.js';

// Individual Components
export { CounterComponent } from './components/CounterComponent.js';
export { DataFetchComponent } from './components/DataFetchComponent.js';
export { ModernAPIDemo } from './components/ModernAPIDemo.js';
export { WeatherWidget } from './components/WeatherWidget.js';

// Utility Classes
export { StateManager } from './utils/StateManager.js';
export { EventBus } from './utils/EventBus.js';

// Default export for easy consumption
export default {
  // Main App
  JSShowcaseApp,
  
  // Components
  CounterComponent,
  DataFetchComponent,
  ModernAPIDemo,
  WeatherWidget,
  
  // Utils
  StateManager,
  EventBus,
  
  // Factory methods for easy instantiation
  createApp: (options = {}) => new JSShowcaseApp(options),
  createCounter: (options = {}) => new CounterComponent(options),
  createDataFetch: (options = {}) => new DataFetchComponent(options),
  createAPIDemo: (options = {}) => new ModernAPIDemo(options),
  createWeather: (options = {}) => new WeatherWidget(options),
  createStateManager: (initialState = {}) => new StateManager(initialState),
  createEventBus: () => new EventBus(),
  
  // Utility functions
  mount: async (container, componentType = 'app', options = {}) => {
    let component;
    
    switch (componentType) {
      case 'app':
        component = new JSShowcaseApp(options);
        break;
      case 'counter':
        component = new CounterComponent(options);
        break;
      case 'data-fetch':
        component = new DataFetchComponent(options);
        break;
      case 'api-demo':
        component = new ModernAPIDemo(options);
        break;
      case 'weather':
        component = new WeatherWidget(options);
        break;
      default:
        throw new Error(`Unknown component type: ${componentType}`);
    }
    
    await component.mount(container);
    return component;
  },
  
  // Version and metadata
  version: '1.0.0',
  name: 'JavaScript Remote',
  description: 'Modern ES2022+ JavaScript Micro-Frontend',
  features: [
    'ES2022 Private Fields',
    'Classes & Modules',
    'Async/Await',
    'Destructuring',
    'Template Literals',
    'Arrow Functions',
    'Map/Set Collections',
    'Proxy & Reflect',
    'Async Iterators',
    'Optional Chaining',
    'Nullish Coalescing',
    'Dynamic Imports',
    'AbortController',
    'Modern Web APIs'
  ]
};

// Auto-initialization for standalone usage
if (typeof window !== 'undefined' && !window.jsRemoteLoaded) {
  window.jsRemote = {
    ...arguments[0], // Export default object
    
    // Global mount function for easy usage
    mount: async (selector, componentType = 'app', options = {}) => {
      const container = typeof selector === 'string' 
        ? document.querySelector(selector) 
        : selector;
        
      if (!container) {
        throw new Error(`Container not found: ${selector}`);
      }
      
      return await arguments[0].mount(container, componentType, options);
    }
  };
  
  window.jsRemoteLoaded = true;
  
  console.log('🚀 JavaScript Remote loaded globally as window.jsRemote');
}