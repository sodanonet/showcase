// Event Bus for cross-framework communication in micro-frontend architecture
export type EventHandler<T = any> = (payload: T) => void;

export interface EventSubscription {
  unsubscribe: () => void;
}

export interface EventBusOptions {
  enableLogging?: boolean;
  maxListeners?: number;
}

class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private options: EventBusOptions;

  constructor(options: EventBusOptions = {}) {
    this.options = {
      enableLogging: false,
      maxListeners: 100,
      ...options,
    };
  }

  /**
   * Subscribe to an event
   * @param event Event name
   * @param handler Event handler function
   * @returns Subscription object with unsubscribe method
   */
  on<T = any>(event: string, handler: EventHandler<T>): EventSubscription {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const eventListeners = this.listeners.get(event)!;
    
    // Check max listeners limit
    if (eventListeners.size >= this.options.maxListeners!) {
      console.warn(`EventBus: Maximum listeners (${this.options.maxListeners}) reached for event "${event}"`);
    }

    eventListeners.add(handler);

    if (this.options.enableLogging) {
      console.log(`EventBus: Subscribed to "${event}". Total listeners: ${eventListeners.size}`);
    }

    return {
      unsubscribe: () => this.off(event, handler),
    };
  }

  /**
   * Subscribe to an event that will only fire once
   * @param event Event name
   * @param handler Event handler function
   * @returns Subscription object with unsubscribe method
   */
  once<T = any>(event: string, handler: EventHandler<T>): EventSubscription {
    const onceHandler: EventHandler<T> = (payload: T) => {
      handler(payload);
      this.off(event, onceHandler);
    };

    return this.on(event, onceHandler);
  }

  /**
   * Unsubscribe from an event
   * @param event Event name
   * @param handler Event handler function to remove
   */
  off(event: string, handler: EventHandler): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(handler);
      
      if (this.options.enableLogging) {
        console.log(`EventBus: Unsubscribed from "${event}". Remaining listeners: ${eventListeners.size}`);
      }

      // Clean up empty event listener sets
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event to all subscribers
   * @param event Event name
   * @param payload Event payload
   */
  emit<T = any>(event: string, payload?: T): void {
    const eventListeners = this.listeners.get(event);
    
    if (this.options.enableLogging) {
      console.log(`EventBus: Emitting "${event}" to ${eventListeners?.size || 0} listeners`, payload);
    }

    if (eventListeners && eventListeners.size > 0) {
      // Create a copy of listeners to avoid issues if handlers modify the listeners during iteration
      const listenersArray = Array.from(eventListeners);
      
      listenersArray.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`EventBus: Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for a specific event
   * @param event Event name
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      if (this.options.enableLogging) {
        console.log(`EventBus: Removed all listeners for "${event}"`);
      }
    } else {
      this.listeners.clear();
      if (this.options.enableLogging) {
        console.log('EventBus: Removed all listeners for all events');
      }
    }
  }

  /**
   * Get the number of listeners for an event
   * @param event Event name
   * @returns Number of listeners
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }

  /**
   * Get all event names that have listeners
   * @returns Array of event names
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Create a namespaced event bus
   * @param namespace Namespace prefix
   * @returns Namespaced event bus
   */
  namespace(namespace: string) {
    return {
      on: <T = any>(event: string, handler: EventHandler<T>) => 
        this.on(`${namespace}:${event}`, handler),
      
      once: <T = any>(event: string, handler: EventHandler<T>) => 
        this.once(`${namespace}:${event}`, handler),
      
      off: (event: string, handler: EventHandler) => 
        this.off(`${namespace}:${event}`, handler),
      
      emit: <T = any>(event: string, payload?: T) => 
        this.emit(`${namespace}:${event}`, payload),
      
      removeAllListeners: (event?: string) => 
        this.removeAllListeners(event ? `${namespace}:${event}` : undefined),
    };
  }

  /**
   * Create an async version of emit that returns a promise
   * @param event Event name
   * @param payload Event payload
   * @param timeout Timeout in milliseconds
   * @returns Promise that resolves when all handlers complete
   */
  async emitAsync<T = any>(event: string, payload?: T, timeout = 5000): Promise<void> {
    const eventListeners = this.listeners.get(event);
    
    if (!eventListeners || eventListeners.size === 0) {
      return;
    }

    const listenersArray = Array.from(eventListeners);
    const promises = listenersArray.map(handler => {
      return new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Event handler timeout for "${event}"`));
        }, timeout);

        try {
          const result = handler(payload);
          
          // Handle async handlers
          if (result && typeof result.then === 'function') {
            result.then(() => {
              clearTimeout(timeoutId);
              resolve();
            }).catch((error: any) => {
              clearTimeout(timeoutId);
              reject(error);
            });
          } else {
            clearTimeout(timeoutId);
            resolve();
          }
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      });
    });

    await Promise.all(promises);
  }
}

// Create global event bus instance
export const globalEventBus = new EventBus({ enableLogging: false });

// Create factory function for creating isolated event buses
export const createEventBus = (options?: EventBusOptions): EventBus => {
  return new EventBus(options);
};

// Utility functions for common micro-frontend events
export const microFrontendEvents = {
  // Navigation events
  NAVIGATE: 'mf:navigate',
  ROUTE_CHANGE: 'mf:route-change',
  
  // Loading states
  REMOTE_LOADING: 'mf:remote-loading',
  REMOTE_LOADED: 'mf:remote-loaded',
  REMOTE_ERROR: 'mf:remote-error',
  
  // User events
  USER_LOGIN: 'mf:user-login',
  USER_LOGOUT: 'mf:user-logout',
  USER_UPDATE: 'mf:user-update',
  
  // Theme events
  THEME_CHANGE: 'mf:theme-change',
  
  // Data sharing
  DATA_UPDATE: 'mf:data-update',
  STATE_SYNC: 'mf:state-sync',
  
  // Error handling
  GLOBAL_ERROR: 'mf:global-error',
  
  // Notifications
  SHOW_NOTIFICATION: 'mf:show-notification',
  HIDE_NOTIFICATION: 'mf:hide-notification',
};

// Type-safe event emitters for common events
export const microFrontendEmitters = {
  navigate: (path: string) => globalEventBus.emit(microFrontendEvents.NAVIGATE, { path }),
  
  routeChange: (from: string, to: string) => 
    globalEventBus.emit(microFrontendEvents.ROUTE_CHANGE, { from, to }),
  
  remoteLoading: (remoteName: string) => 
    globalEventBus.emit(microFrontendEvents.REMOTE_LOADING, { remoteName }),
  
  remoteLoaded: (remoteName: string, loadTime: number) => 
    globalEventBus.emit(microFrontendEvents.REMOTE_LOADED, { remoteName, loadTime }),
  
  remoteError: (remoteName: string, error: Error) => 
    globalEventBus.emit(microFrontendEvents.REMOTE_ERROR, { remoteName, error }),
  
  userLogin: (user: any) => 
    globalEventBus.emit(microFrontendEvents.USER_LOGIN, user),
  
  userLogout: () => 
    globalEventBus.emit(microFrontendEvents.USER_LOGOUT),
  
  themeChange: (theme: any) => 
    globalEventBus.emit(microFrontendEvents.THEME_CHANGE, theme),
  
  showNotification: (notification: any) => 
    globalEventBus.emit(microFrontendEvents.SHOW_NOTIFICATION, notification),
  
  globalError: (error: Error, context?: any) => 
    globalEventBus.emit(microFrontendEvents.GLOBAL_ERROR, { error, context }),
};