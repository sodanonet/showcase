// Modern JavaScript State Management using ES2022+ features
export class StateManager {
  // Private fields for encapsulation
  #state = new Map();
  #subscribers = new Map();
  #middleware = [];
  #history = [];
  #maxHistorySize = 50;

  constructor(initialState = {}) {
    // Initialize state from object or Map
    if (initialState instanceof Map) {
      this.#state = new Map(initialState);
    } else {
      this.#state = new Map(Object.entries(initialState));
    }

    // Enable state persistence
    this.#loadFromStorage();
    this.#setupStorageSync();
  }

  // Public methods for state access

  get(key) {
    return this.#state.get(key);
  }

  set(key, value) {
    const oldValue = this.#state.get(key);
    
    // Apply middleware before setting
    const newValue = this.#applyMiddleware('set', { key, value, oldValue });
    
    // Update state
    this.#state.set(key, newValue.value);
    
    // Record history
    this.#recordHistory('set', key, oldValue, newValue.value);
    
    // Notify subscribers
    this.#notifySubscribers(key, newValue.value, oldValue);
    
    // Sync to storage
    this.#syncToStorage();
    
    return this;
  }

  has(key) {
    return this.#state.has(key);
  }

  delete(key) {
    const oldValue = this.#state.get(key);
    
    if (this.#state.has(key)) {
      // Apply middleware
      this.#applyMiddleware('delete', { key, oldValue });
      
      // Delete from state
      this.#state.delete(key);
      
      // Record history
      this.#recordHistory('delete', key, oldValue, undefined);
      
      // Notify subscribers
      this.#notifySubscribers(key, undefined, oldValue);
      
      // Sync to storage
      this.#syncToStorage();
    }
    
    return this;
  }

  clear() {
    const oldState = new Map(this.#state);
    
    // Apply middleware
    this.#applyMiddleware('clear', { oldState });
    
    // Clear state
    this.#state.clear();
    
    // Record history
    this.#recordHistory('clear', null, oldState, new Map());
    
    // Notify all subscribers
    oldState.forEach((value, key) => {
      this.#notifySubscribers(key, undefined, value);
    });
    
    // Sync to storage
    this.#syncToStorage();
    
    return this;
  }

  // Batch operations for performance
  batch(operations) {
    const results = [];
    
    // Temporarily disable notifications
    const originalNotify = this.#notifySubscribers;
    const changedKeys = new Set();
    
    this.#notifySubscribers = (key, newValue, oldValue) => {
      changedKeys.add({ key, newValue, oldValue });
    };
    
    try {
      // Execute all operations
      for (const { type, key, value } of operations) {
        switch (type) {
          case 'set':
            this.set(key, value);
            break;
          case 'delete':
            this.delete(key);
            break;
          default:
            throw new Error(`Unknown batch operation: ${type}`);
        }
      }
      
      results.push(...operations);
      
    } finally {
      // Restore notification function
      this.#notifySubscribers = originalNotify;
      
      // Send batch notifications
      changedKeys.forEach(({ key, newValue, oldValue }) => {
        this.#notifySubscribers(key, newValue, oldValue);
      });
    }
    
    return results;
  }

  // Subscription system for reactive updates
  subscribe(key, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    if (!this.#subscribers.has(key)) {
      this.#subscribers.set(key, new Set());
    }

    this.#subscribers.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const keySubscribers = this.#subscribers.get(key);
      if (keySubscribers) {
        keySubscribers.delete(callback);
        if (keySubscribers.size === 0) {
          this.#subscribers.delete(key);
        }
      }
    };
  }

  // Subscribe to all state changes
  subscribeAll(callback) {
    return this.subscribe('*', callback);
  }

  // Computed values that automatically update
  computed(key, computeFunction, dependencies = []) {
    if (typeof computeFunction !== 'function') {
      throw new TypeError('Compute function must be a function');
    }

    // Calculate initial value
    const initialValue = computeFunction(this.#getStateSnapshot());
    this.set(key, initialValue);

    // Set up reactive dependencies
    const unsubscribeFunctions = dependencies.map(depKey => 
      this.subscribe(depKey, () => {
        const newValue = computeFunction(this.#getStateSnapshot());
        this.set(key, newValue);
      })
    );

    // Return cleanup function
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
      this.delete(key);
    };
  }

  // Middleware system for intercepting operations
  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new TypeError('Middleware must be a function');
    }

    this.#middleware.push(middleware);

    // Return function to remove middleware
    return () => {
      const index = this.#middleware.indexOf(middleware);
      if (index > -1) {
        this.#middleware.splice(index, 1);
      }
    };
  }

  // State persistence
  persist(key = 'js-remote-state') {
    this.storageKey = key;
    this.#syncToStorage();
  }

  // Get state snapshot for external use
  getSnapshot() {
    return this.#getStateSnapshot();
  }

  // Get state as plain object
  toObject() {
    return Object.fromEntries(this.#state);
  }

  // Get state as JSON string
  toJSON() {
    return JSON.stringify(this.toObject());
  }

  // Restore state from object
  fromObject(obj) {
    this.clear();
    Object.entries(obj).forEach(([key, value]) => {
      this.set(key, value);
    });
    return this;
  }

  // History management
  getHistory() {
    return [...this.#history];
  }

  undo() {
    const lastEntry = this.#history[this.#history.length - 1];
    if (!lastEntry) return false;

    const { type, key, oldValue } = lastEntry;
    
    // Reverse the last operation
    switch (type) {
      case 'set':
        if (oldValue === undefined) {
          this.delete(key);
        } else {
          this.set(key, oldValue);
        }
        break;
      case 'delete':
        this.set(key, oldValue);
        break;
      case 'clear':
        this.fromObject(Object.fromEntries(oldValue));
        break;
    }

    // Remove the history entry
    this.#history.pop();
    return true;
  }

  canUndo() {
    return this.#history.length > 0;
  }

  clearHistory() {
    this.#history = [];
  }

  // Private methods

  #getStateSnapshot() {
    return new Proxy(this.#state, {
      get: (target, prop) => {
        if (typeof target[prop] === 'function') {
          return target[prop].bind(target);
        }
        return target.get(prop);
      },
      set: () => {
        throw new Error('State snapshot is read-only');
      },
      deleteProperty: () => {
        throw new Error('State snapshot is read-only');
      }
    });
  }

  #notifySubscribers(key, newValue, oldValue) {
    // Notify specific key subscribers
    const keySubscribers = this.#subscribers.get(key);
    if (keySubscribers) {
      keySubscribers.forEach(callback => {
        try {
          callback(newValue, oldValue, key);
        } catch (error) {
          console.error('State subscriber error:', error);
        }
      });
    }

    // Notify global subscribers
    const globalSubscribers = this.#subscribers.get('*');
    if (globalSubscribers) {
      globalSubscribers.forEach(callback => {
        try {
          callback(newValue, oldValue, key);
        } catch (error) {
          console.error('Global state subscriber error:', error);
        }
      });
    }
  }

  #applyMiddleware(operation, payload) {
    let result = payload;
    
    for (const middleware of this.#middleware) {
      try {
        const middlewareResult = middleware(operation, result);
        if (middlewareResult !== undefined) {
          result = middlewareResult;
        }
      } catch (error) {
        console.error('State middleware error:', error);
      }
    }
    
    return result;
  }

  #recordHistory(type, key, oldValue, newValue) {
    this.#history.push({
      type,
      key,
      oldValue,
      newValue,
      timestamp: Date.now()
    });

    // Limit history size
    if (this.#history.length > this.#maxHistorySize) {
      this.#history.shift();
    }
  }

  #loadFromStorage() {
    if (!this.storageKey || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, value]) => {
          this.#state.set(key, value);
        });
      }
    } catch (error) {
      console.warn('Failed to load state from storage:', error);
    }
  }

  #syncToStorage() {
    if (!this.storageKey || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const data = this.toJSON();
      localStorage.setItem(this.storageKey, data);
    } catch (error) {
      console.warn('Failed to sync state to storage:', error);
    }
  }

  #setupStorageSync() {
    if (typeof window === 'undefined') return;

    // Listen for storage changes from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey && event.newValue) {
        try {
          const newState = JSON.parse(event.newValue);
          this.fromObject(newState);
        } catch (error) {
          console.warn('Failed to sync state from storage event:', error);
        }
      }
    });
  }

  // Static factory methods
  static create(initialState = {}) {
    return new StateManager(initialState);
  }

  static fromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      return new StateManager(data);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }

  // Utility methods for common patterns
  increment(key, amount = 1) {
    const current = this.get(key) || 0;
    this.set(key, current + amount);
    return this;
  }

  toggle(key) {
    const current = this.get(key);
    this.set(key, !current);
    return this;
  }

  push(key, value) {
    const array = this.get(key) || [];
    if (!Array.isArray(array)) {
      throw new TypeError(`Value at key "${key}" is not an array`);
    }
    this.set(key, [...array, value]);
    return this;
  }

  merge(key, obj) {
    const current = this.get(key) || {};
    if (typeof current !== 'object' || Array.isArray(current)) {
      throw new TypeError(`Value at key "${key}" is not an object`);
    }
    this.set(key, { ...current, ...obj });
    return this;
  }
}