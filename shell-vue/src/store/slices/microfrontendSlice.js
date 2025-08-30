import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Registered micro-frontends
  registeredApps: {
    'react-remote': {
      name: 'React Remote',
      url: 'http://localhost:3001',
      status: 'unknown', // 'loading' | 'ready' | 'error' | 'unknown'
      version: '1.0.0',
      lastHealthCheck: null,
      capabilities: ['counter', 'user-auth', 'theme'],
      storeConnected: false
    },
    'vue-remote': {
      name: 'Vue Remote',
      url: 'http://localhost:3002',
      status: 'unknown',
      version: '1.0.0',
      lastHealthCheck: null,
      capabilities: ['counter', 'todos', 'user-auth', 'theme'],
      storeConnected: false
    },
    'angular-remote': {
      name: 'Angular Remote',
      url: 'http://localhost:3004',
      status: 'unknown',
      version: '1.0.0',
      lastHealthCheck: null,
      capabilities: ['counter', 'data-management', 'user-auth', 'theme'],
      storeConnected: false
    },
    'ts-remote': {
      name: 'TypeScript Remote',
      url: 'http://localhost:3005',
      status: 'unknown',
      version: '1.0.0',
      lastHealthCheck: null,
      capabilities: ['counter', 'web-components', 'theme'],
      storeConnected: false
    },
    'js-remote': {
      name: 'JavaScript Remote',
      url: 'http://localhost:3006',
      status: 'unknown',
      version: '1.0.0',
      lastHealthCheck: null,
      capabilities: ['counter', 'modern-js', 'theme'],
      storeConnected: false
    }
  },
  
  // Current active app
  currentApp: 'react-remote',
  
  // Remote states (synced from individual stores)
  remoteStates: {
    'react-remote': {
      counter: 0,
      user: { isAuthenticated: false },
      theme: { mode: 'light' },
      lastUpdated: null
    },
    'vue-remote': {
      counter: 0,
      user: { isAuthenticated: false },
      theme: { mode: 'light' },
      todos: { total: 0 },
      lastUpdated: null
    },
    'angular-remote': {
      counter: 0,
      user: { isAuthenticated: false },
      theme: { mode: 'light' },
      data: { totalItems: 0 },
      lastUpdated: null
    },
    'ts-remote': {
      counter: 0,
      user: { isAuthenticated: false },
      theme: { mode: 'light' },
      components: { totalInstances: 0 },
      lastUpdated: null
    },
    'js-remote': {
      counter: 0,
      user: { isAuthenticated: false },
      theme: { mode: 'light' },
      lastUpdated: null
    }
  },
  
  // Communication & Events
  crossAppMessages: [],
  eventLog: [],
  
  // Performance & Health
  healthChecks: {
    enabled: true,
    interval: 30000, // 30 seconds
    timeout: 5000,   // 5 seconds
    retries: 3
  },
  
  loadingStates: {
    'react-remote': false,
    'vue-remote': false,
    'angular-remote': false,
    'ts-remote': false,
    'js-remote': false
  },
  
  errors: {},
  
  // Statistics
  statistics: {
    totalAppsRegistered: 5,
    totalAppsReady: 0,
    totalStateUpdates: 0,
    totalCrossAppMessages: 0,
    totalErrors: 0,
    uptime: Date.now()
  }
};

const microfrontendSlice = createSlice({
  name: 'microfrontend',
  initialState,
  reducers: {
    // App registration and status
    updateAppStatus: (state, action) => {
      const { appName, status } = action.payload;
      if (state.registeredApps[appName]) {
        state.registeredApps[appName].status = status;
        state.registeredApps[appName].lastHealthCheck = Date.now();
        
        // Update statistics
        const readyApps = Object.values(state.registeredApps).filter(app => app.status === 'ready').length;
        state.statistics.totalAppsReady = readyApps;
      }
    },
    
    setAppLoading: (state, action) => {
      const { appName, loading } = action.payload;
      state.loadingStates[appName] = loading;
    },
    
    setAppError: (state, action) => {
      const { appName, error } = action.payload;
      state.errors[appName] = {
        message: error,
        timestamp: Date.now()
      };
      state.statistics.totalErrors += 1;
    },
    
    clearAppError: (state, action) => {
      const appName = action.payload;
      delete state.errors[appName];
    },
    
    setStoreConnected: (state, action) => {
      const { appName, connected } = action.payload;
      if (state.registeredApps[appName]) {
        state.registeredApps[appName].storeConnected = connected;
      }
    },
    
    // Navigation
    setCurrentApp: (state, action) => {
      state.currentApp = action.payload;
      
      // Log navigation event
      state.eventLog.unshift({
        type: 'navigation',
        from: state.currentApp,
        to: action.payload,
        timestamp: Date.now()
      });
      
      // Keep only last 50 events
      if (state.eventLog.length > 50) {
        state.eventLog = state.eventLog.slice(0, 50);
      }
    },
    
    // State synchronization
    updateRemoteState: (state, action) => {
      const { appName, stateUpdate } = action.payload;
      if (state.remoteStates[appName]) {
        state.remoteStates[appName] = {
          ...state.remoteStates[appName],
          ...stateUpdate,
          lastUpdated: Date.now()
        };
        state.statistics.totalStateUpdates += 1;
      }
    },
    
    updateRemoteStates: (state, action) => {
      Object.keys(action.payload).forEach(appName => {
        if (state.remoteStates[appName]) {
          state.remoteStates[appName] = {
            ...state.remoteStates[appName],
            ...action.payload[appName],
            lastUpdated: Date.now()
          };
        }
      });
      state.statistics.totalStateUpdates += 1;
    },
    
    // Cross-app messaging
    sendCrossAppMessage: (state, action) => {
      const message = {
        id: Date.now().toString(),
        from: action.payload.from,
        to: action.payload.to || 'all',
        type: action.payload.type,
        payload: action.payload.payload,
        timestamp: Date.now(),
        delivered: false
      };
      
      state.crossAppMessages.unshift(message);
      state.statistics.totalCrossAppMessages += 1;
      
      // Keep only last 100 messages
      if (state.crossAppMessages.length > 100) {
        state.crossAppMessages = state.crossAppMessages.slice(0, 100);
      }
      
      // Log event
      state.eventLog.unshift({
        type: 'cross-app-message',
        messageId: message.id,
        from: message.from,
        to: message.to,
        timestamp: Date.now()
      });
    },
    
    markMessageDelivered: (state, action) => {
      const messageId = action.payload;
      const message = state.crossAppMessages.find(m => m.id === messageId);
      if (message) {
        message.delivered = true;
      }
    },
    
    clearCrossAppMessages: (state) => {
      state.crossAppMessages = [];
    },
    
    // Health monitoring
    updateHealthCheckSettings: (state, action) => {
      state.healthChecks = { ...state.healthChecks, ...action.payload };
    },
    
    performHealthCheck: (state, action) => {
      const { appName, success, responseTime } = action.payload;
      if (state.registeredApps[appName]) {
        state.registeredApps[appName].lastHealthCheck = Date.now();
        state.registeredApps[appName].status = success ? 'ready' : 'error';
        
        if (responseTime) {
          state.registeredApps[appName].responseTime = responseTime;
        }
      }
      
      // Update ready apps count
      const readyApps = Object.values(state.registeredApps).filter(app => app.status === 'ready').length;
      state.statistics.totalAppsReady = readyApps;
    },
    
    // Utility actions
    clearEventLog: (state) => {
      state.eventLog = [];
    },
    
    clearAllErrors: (state) => {
      state.errors = {};
    },
    
    resetStatistics: (state) => {
      state.statistics = {
        totalAppsRegistered: Object.keys(state.registeredApps).length,
        totalAppsReady: Object.values(state.registeredApps).filter(app => app.status === 'ready').length,
        totalStateUpdates: 0,
        totalCrossAppMessages: 0,
        totalErrors: 0,
        uptime: Date.now()
      };
    },
    
    // Computed getters (for use in components)
    getAppSummary: (state) => {
      return {
        total: state.statistics.totalAppsRegistered,
        ready: state.statistics.totalAppsReady,
        loading: Object.values(state.loadingStates).filter(Boolean).length,
        error: Object.keys(state.errors).length,
        storeConnected: Object.values(state.registeredApps).filter(app => app.storeConnected).length
      };
    },
    
    getAggregatedCounters: (state) => {
      return Object.values(state.remoteStates).reduce((total, remoteState) => {
        return total + (remoteState.counter || 0);
      }, 0);
    },
    
    getGlobalAuthStatus: (state) => {
      const authenticatedApps = Object.values(state.remoteStates)
        .filter(remoteState => remoteState.user?.isAuthenticated).length;
      
      return {
        total: Object.keys(state.remoteStates).length,
        authenticated: authenticatedApps,
        percentage: Math.round((authenticatedApps / Object.keys(state.remoteStates).length) * 100)
      };
    }
  }
});

export const {
  updateAppStatus,
  setAppLoading,
  setAppError,
  clearAppError,
  setStoreConnected,
  setCurrentApp,
  updateRemoteState,
  updateRemoteStates,
  sendCrossAppMessage,
  markMessageDelivered,
  clearCrossAppMessages,
  updateHealthCheckSettings,
  performHealthCheck,
  clearEventLog,
  clearAllErrors,
  resetStatistics,
  getAppSummary,
  getAggregatedCounters,
  getGlobalAuthStatus
} = microfrontendSlice.actions;

export default microfrontendSlice.reducer;