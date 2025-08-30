import { configureStore } from '@reduxjs/toolkit';
import globalCounterSlice from './slices/globalCounterSlice';
import globalUserSlice from './slices/globalUserSlice';
import globalThemeSlice from './slices/globalThemeSlice';
import microfrontendSlice from './slices/microfrontendSlice';
import appStateSlice from './slices/appStateSlice';

// Global store manager for cross-micro-frontend communication
class GlobalStateManager {
  constructor(store) {
    this.store = store;
    this.remoteStores = new Map();
    this.subscribers = new Set();
    this.syncInProgress = false;
    
    // Bind methods
    this.dispatch = this.dispatch.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.syncStates = this.syncStates.bind(this);
    
    // Setup periodic sync
    setInterval(() => {
      if (!this.syncInProgress) {
        this.syncStates();
      }
    }, 5000); // Sync every 5 seconds
  }

  registerRemoteStore(name, store) {
    this.remoteStores.set(name, store);
    console.log(`Registered remote store: ${name}`);
    
    // Initial sync
    this.syncStates();
  }

  dispatch(action) {
    // Dispatch to main store
    const result = this.store.dispatch(action);
    
    // Broadcast to remote stores if it's a global action
    if (action.type.startsWith('global/') || action.source === 'shell-vue') {
      this.broadcastToRemotes(action);
    }
    
    // Notify subscribers
    this.notifySubscribers(action);
    
    return result;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  broadcastToRemotes(action) {
    // Create custom event for cross-micro-frontend communication
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('globalStateUpdate', {
        detail: {
          type: this.mapActionType(action.type),
          payload: action.payload,
          source: action.source || 'shell-vue',
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(event);
    }
  }

  mapActionType(type) {
    // Map Redux action types to global event types
    const mapping = {
      'globalCounter/increment': 'GLOBAL_COUNTER_UPDATE',
      'globalCounter/decrement': 'GLOBAL_COUNTER_UPDATE',
      'globalCounter/reset': 'GLOBAL_COUNTER_UPDATE',
      'globalUser/login': 'GLOBAL_USER_UPDATE',
      'globalUser/logout': 'GLOBAL_USER_UPDATE',
      'globalTheme/setMode': 'GLOBAL_THEME_UPDATE',
      'globalTheme/setColors': 'GLOBAL_THEME_UPDATE'
    };
    return mapping[type] || 'GLOBAL_STATE_UPDATE';
  }

  syncStates() {
    this.syncInProgress = true;
    
    try {
      // Collect states from all remote stores
      const remoteStates = {};
      
      this.remoteStores.forEach((store, name) => {
        try {
          if (store && typeof store.getState === 'function') {
            remoteStates[name] = {
              counter: store.getState().counter?.value || 0,
              user: store.getState().user?.isAuthenticated || false,
              theme: store.getState().theme?.mode || 'light',
              timestamp: Date.now()
            };
          }
        } catch (error) {
          console.warn(`Failed to sync state from ${name}:`, error);
        }
      });

      // Update microfrontend slice with remote states
      this.store.dispatch({
        type: 'microfrontend/updateRemoteStates',
        payload: remoteStates
      });

    } finally {
      this.syncInProgress = false;
    }
  }

  notifySubscribers(action) {
    this.subscribers.forEach(callback => {
      try {
        callback(action, this.store.getState());
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  getGlobalState() {
    return this.store.getState();
  }

  // Method to get aggregated counter from all remotes
  getAggregatedCounter() {
    const state = this.store.getState();
    let total = state.globalCounter.value;
    
    Object.values(state.microfrontend.remoteStates).forEach(remoteState => {
      total += remoteState.counter || 0;
    });
    
    return total;
  }

  // Method to check if any user is authenticated
  isAnyUserAuthenticated() {
    const state = this.store.getState();
    
    if (state.globalUser.isAuthenticated) return true;
    
    return Object.values(state.microfrontend.remoteStates).some(
      remoteState => remoteState.user
    );
  }
}

export const createUnifiedStore = (preloadedState = {}) => {
  const store = configureStore({
    reducer: {
      globalCounter: globalCounterSlice,
      globalUser: globalUserSlice,
      globalTheme: globalThemeSlice,
      microfrontend: microfrontendSlice,
      appState: appStateSlice,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Allow non-serializable values for cross-app communication
      }),
  });

  // Create global state manager
  const globalStateManager = new GlobalStateManager(store);

  // Expose globally for Module Federation communication
  if (typeof window !== 'undefined') {
    window.__GLOBAL_STATE_MANAGER__ = globalStateManager;
    window.__SHELL_VUE_STORE__ = store;
    
    // Auto-register remote stores when they become available
    const checkForRemoteStores = () => {
      const remoteStoreNames = [
        '__REACT_REMOTE_STORE__',
        '__VUE_REMOTE_STORE__',
        '__ANGULAR_REMOTE_STORE__',
        '__TS_REMOTE_STORE__',
        '__JS_REMOTE_STORE__'
      ];
      
      remoteStoreNames.forEach(storeName => {
        if (window[storeName] && !globalStateManager.remoteStores.has(storeName)) {
          globalStateManager.registerRemoteStore(storeName, window[storeName]);
        }
      });
    };
    
    // Check every 2 seconds for new remote stores
    setInterval(checkForRemoteStores, 2000);
    
    // Also check immediately
    setTimeout(checkForRemoteStores, 1000);
  }

  return { store, globalStateManager };
};

const { store, globalStateManager } = createUnifiedStore();

export { globalStateManager };
export default store;