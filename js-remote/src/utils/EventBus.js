// Modern Event Bus using ES2022+ features
export class EventBus {
  // Private fields for encapsulation
  #listeners = new Map();
  #onceListeners = new Map();
  #middleware = [];
  #eventHistory = [];
  #maxHistorySize = 100;
  #wildcardListeners = new Set();

  constructor() {
    // Enable event persistence if needed
    this.#setupGlobalErrorHandling();
  }

  // Core event methods

  on(eventName, listener, options = {}) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }

    const { priority = 0, once = false } = options;

    if (once) {
      return this.once(eventName, listener, { priority });
    }

    // Handle wildcard listeners
    if (eventName === '*') {
      this.#wildcardListeners.add({ listener, priority });
      return this.#createUnsubscribeFunction('*', listener);
    }

    if (!this.#listeners.has(eventName)) {
      this.#listeners.set(eventName, []);
    }

    const listenerObj = { listener, priority, id: this.#generateId() };
    const listeners = this.#listeners.get(eventName);
    
    // Insert listener based on priority (higher priority first)
    const insertIndex = listeners.findIndex(l => l.priority < priority);
    if (insertIndex === -1) {
      listeners.push(listenerObj);
    } else {
      listeners.splice(insertIndex, 0, listenerObj);
    }

    return this.#createUnsubscribeFunction(eventName, listener);
  }

  once(eventName, listener, options = {}) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }

    const { priority = 0 } = options;

    if (!this.#onceListeners.has(eventName)) {
      this.#onceListeners.set(eventName, []);
    }

    const listenerObj = { listener, priority, id: this.#generateId() };
    const listeners = this.#onceListeners.get(eventName);
    
    // Insert listener based on priority
    const insertIndex = listeners.findIndex(l => l.priority < priority);
    if (insertIndex === -1) {
      listeners.push(listenerObj);
    } else {
      listeners.splice(insertIndex, 0, listenerObj);
    }

    return this.#createUnsubscribeFunction(eventName, listener, true);
  }

  off(eventName, listener) {
    if (eventName === '*' && this.#wildcardListeners.size > 0) {
      // Remove from wildcard listeners
      for (const wildcardListener of this.#wildcardListeners) {
        if (wildcardListener.listener === listener) {
          this.#wildcardListeners.delete(wildcardListener);
          break;
        }
      }
      return this;
    }

    // Remove from regular listeners
    const listeners = this.#listeners.get(eventName);
    if (listeners) {
      const index = listeners.findIndex(l => l.listener === listener);
      if (index > -1) {
        listeners.splice(index, 1);
        if (listeners.length === 0) {
          this.#listeners.delete(eventName);
        }
      }
    }

    // Remove from once listeners
    const onceListeners = this.#onceListeners.get(eventName);
    if (onceListeners) {
      const index = onceListeners.findIndex(l => l.listener === listener);
      if (index > -1) {
        onceListeners.splice(index, 1);
        if (onceListeners.length === 0) {
          this.#onceListeners.delete(eventName);
        }
      }
    }

    return this;
  }

  emit(eventName, ...args) {
    const eventData = {
      name: eventName,
      args,
      timestamp: Date.now(),
      id: this.#generateId()
    };

    // Record event in history
    this.#recordEvent(eventData);

    // Apply middleware
    const processedData = this.#applyMiddleware('emit', eventData);
    
    if (processedData === false) {
      // Event was cancelled by middleware
      return this;
    }

    let listenerCount = 0;

    try {
      // Call regular listeners
      const listeners = this.#listeners.get(eventName) || [];
      for (const { listener } of listeners) {
        try {
          listener(...processedData.args);
          listenerCount++;
        } catch (error) {
          this.#handleListenerError(error, eventName, listener);
        }
      }

      // Call once listeners and remove them
      const onceListeners = this.#onceListeners.get(eventName) || [];
      if (onceListeners.length > 0) {
        for (const { listener } of onceListeners) {
          try {
            listener(...processedData.args);
            listenerCount++;
          } catch (error) {
            this.#handleListenerError(error, eventName, listener);
          }
        }
        // Clear once listeners
        this.#onceListeners.delete(eventName);
      }

      // Call wildcard listeners
      for (const { listener } of this.#wildcardListeners) {
        try {
          listener(eventName, ...processedData.args);
          listenerCount++;
        } catch (error) {
          this.#handleListenerError(error, '*', listener);
        }
      }

    } catch (error) {
      console.error('Event emission error:', error);
    }

    return { eventName, listenerCount, timestamp: processedData.timestamp };
  }

  // Async event emission
  async emitAsync(eventName, ...args) {
    const eventData = {
      name: eventName,
      args,
      timestamp: Date.now(),
      id: this.#generateId()
    };

    this.#recordEvent(eventData);

    const processedData = this.#applyMiddleware('emitAsync', eventData);
    
    if (processedData === false) {
      return this;
    }

    const promises = [];

    // Collect all listeners
    const listeners = this.#listeners.get(eventName) || [];
    const onceListeners = this.#onceListeners.get(eventName) || [];

    // Add regular listeners
    for (const { listener } of listeners) {
      promises.push(this.#callAsyncListener(listener, processedData.args, eventName));
    }

    // Add once listeners
    for (const { listener } of onceListeners) {
      promises.push(this.#callAsyncListener(listener, processedData.args, eventName));
    }

    // Clear once listeners
    if (onceListeners.length > 0) {
      this.#onceListeners.delete(eventName);
    }

    // Add wildcard listeners
    for (const { listener } of this.#wildcardListeners) {
      promises.push(this.#callAsyncListener(listener, [eventName, ...processedData.args], '*'));
    }

    // Wait for all listeners to complete
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return { 
      eventName, 
      successful, 
      failed, 
      total: promises.length, 
      timestamp: processedData.timestamp 
    };
  }

  // Event composition and chaining
  pipe(eventName, targetEventName, transform = null) {
    return this.on(eventName, (...args) => {
      const transformedArgs = transform ? transform(...args) : args;
      this.emit(targetEventName, ...transformedArgs);
    });
  }

  // Conditional event listening
  when(eventName, condition, listener) {
    return this.on(eventName, (...args) => {
      if (condition(...args)) {
        listener(...args);
      }
    });
  }

  // Event debouncing
  debounce(eventName, listener, delay = 300) {
    let timeoutId;
    
    return this.on(eventName, (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        listener(...args);
      }, delay);
    });
  }

  // Event throttling
  throttle(eventName, listener, interval = 300) {
    let lastCall = 0;
    
    return this.on(eventName, (...args) => {
      const now = Date.now();
      if (now - lastCall >= interval) {
        lastCall = now;
        listener(...args);
      }
    });
  }

  // Batch event emission
  batch(events) {
    const results = [];
    
    for (const { eventName, args } of events) {
      const result = this.emit(eventName, ...(args || []));
      results.push(result);
    }
    
    return results;
  }

  // Event filtering and querying
  hasListeners(eventName) {
    const regularListeners = this.#listeners.get(eventName)?.length || 0;
    const onceListeners = this.#onceListeners.get(eventName)?.length || 0;
    const wildcardListeners = eventName === '*' ? 0 : this.#wildcardListeners.size;
    
    return regularListeners + onceListeners + wildcardListeners > 0;
  }

  listenerCount(eventName = null) {
    if (eventName === null) {
      // Count all listeners
      let total = this.#wildcardListeners.size;
      
      for (const listeners of this.#listeners.values()) {
        total += listeners.length;
      }
      
      for (const listeners of this.#onceListeners.values()) {
        total += listeners.length;
      }
      
      return total;
    }
    
    const regularCount = this.#listeners.get(eventName)?.length || 0;
    const onceCount = this.#onceListeners.get(eventName)?.length || 0;
    const wildcardCount = eventName === '*' ? 0 : this.#wildcardListeners.size;
    
    return regularCount + onceCount + wildcardCount;
  }

  eventNames() {
    const names = new Set();
    
    for (const name of this.#listeners.keys()) {
      names.add(name);
    }
    
    for (const name of this.#onceListeners.keys()) {
      names.add(name);
    }
    
    return Array.from(names);
  }

  // Middleware system
  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new TypeError('Middleware must be a function');
    }

    this.#middleware.push(middleware);

    return () => {
      const index = this.#middleware.indexOf(middleware);
      if (index > -1) {
        this.#middleware.splice(index, 1);
      }
    };
  }

  // History and debugging
  getHistory() {
    return [...this.#eventHistory];
  }

  clearHistory() {
    this.#eventHistory = [];
    return this;
  }

  // Remove all listeners
  removeAllListeners(eventName = null) {
    if (eventName === null) {
      this.#listeners.clear();
      this.#onceListeners.clear();
      this.#wildcardListeners.clear();
    } else if (eventName === '*') {
      this.#wildcardListeners.clear();
    } else {
      this.#listeners.delete(eventName);
      this.#onceListeners.delete(eventName);
    }
    
    return this;
  }

  // Promise-based event waiting
  waitFor(eventName, timeout = null) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      
      const cleanup = this.once(eventName, (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve(args);
      });

      if (timeout) {
        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error(`Timeout waiting for event: ${eventName}`));
        }, timeout);
      }
    });
  }

  // Private methods

  #generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  #createUnsubscribeFunction(eventName, listener, isOnce = false) {
    return () => {
      if (isOnce) {
        const listeners = this.#onceListeners.get(eventName);
        if (listeners) {
          const index = listeners.findIndex(l => l.listener === listener);
          if (index > -1) {
            listeners.splice(index, 1);
            if (listeners.length === 0) {
              this.#onceListeners.delete(eventName);
            }
          }
        }
      } else {
        this.off(eventName, listener);
      }
    };
  }

  #applyMiddleware(operation, eventData) {
    let result = eventData;
    
    for (const middleware of this.#middleware) {
      try {
        const middlewareResult = middleware(operation, result);
        if (middlewareResult === false) {
          // Cancel event
          return false;
        }
        if (middlewareResult !== undefined) {
          result = middlewareResult;
        }
      } catch (error) {
        console.error('Event middleware error:', error);
      }
    }
    
    return result;
  }

  #recordEvent(eventData) {
    this.#eventHistory.push(eventData);
    
    if (this.#eventHistory.length > this.#maxHistorySize) {
      this.#eventHistory.shift();
    }
  }

  #handleListenerError(error, eventName, listener) {
    console.error(`Event listener error for "${eventName}":`, error);
    
    // Emit error event for debugging
    this.emit('error', {
      error,
      eventName,
      listener: listener.name || 'anonymous',
      timestamp: Date.now()
    });
  }

  async #callAsyncListener(listener, args, eventName) {
    try {
      const result = listener(...args);
      
      // Handle both sync and async listeners
      if (result instanceof Promise) {
        return await result;
      }
      
      return result;
    } catch (error) {
      this.#handleListenerError(error, eventName, listener);
      throw error;
    }
  }

  #setupGlobalErrorHandling() {
    // Listen for unhandled errors in listeners
    this.on('error', (errorData) => {
      console.warn('EventBus error:', errorData);
    });
  }

  // Static factory methods
  static create() {
    return new EventBus();
  }

  // Utility methods for common patterns
  createNamespace(namespace) {
    const namespacedBus = {
      on: (eventName, listener, options) => 
        this.on(`${namespace}:${eventName}`, listener, options),
      
      once: (eventName, listener, options) => 
        this.once(`${namespace}:${eventName}`, listener, options),
      
      off: (eventName, listener) => 
        this.off(`${namespace}:${eventName}`, listener),
      
      emit: (eventName, ...args) => 
        this.emit(`${namespace}:${eventName}`, ...args),
      
      emitAsync: (eventName, ...args) => 
        this.emitAsync(`${namespace}:${eventName}`, ...args)
    };

    return namespacedBus;
  }

  // Performance monitoring
  getStats() {
    return {
      totalListeners: this.listenerCount(),
      eventNames: this.eventNames().length,
      historySize: this.#eventHistory.length,
      middlewareCount: this.#middleware.length,
      wildcardListeners: this.#wildcardListeners.size,
      memoryUsage: this.#estimateMemoryUsage()
    };
  }

  #estimateMemoryUsage() {
    // Rough estimation of memory usage
    let size = 0;
    
    // Count listeners
    for (const listeners of this.#listeners.values()) {
      size += listeners.length * 100; // Rough estimate per listener
    }
    
    for (const listeners of this.#onceListeners.values()) {
      size += listeners.length * 100;
    }
    
    size += this.#wildcardListeners.size * 100;
    size += this.#eventHistory.length * 200; // Rough estimate per event
    
    return `~${Math.round(size / 1024)}KB`;
  }
}