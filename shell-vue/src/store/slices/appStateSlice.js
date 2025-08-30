import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for persisting app state
export const persistAppState = createAsyncThunk(
  'appState/persist',
  async (_, { getState }) => {
    const state = getState();
    const stateToPersist = {
      globalTheme: state.globalTheme,
      globalUser: {
        globalPreferences: state.globalUser.globalPreferences,
        globalPermissions: state.globalUser.globalPermissions
      },
      appState: {
        preferences: state.appState.preferences,
        layout: state.appState.layout
      },
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem('showcase_app_state', JSON.stringify(stateToPersist));
      return { success: true, timestamp: Date.now() };
    } catch (error) {
      throw new Error('Failed to persist state: ' + error.message);
    }
  }
);

export const loadPersistedState = createAsyncThunk(
  'appState/load',
  async () => {
    try {
      const persistedState = localStorage.getItem('showcase_app_state');
      if (persistedState) {
        const parsed = JSON.parse(persistedState);
        return parsed;
      }
      return null;
    } catch (error) {
      throw new Error('Failed to load persisted state: ' + error.message);
    }
  }
);

const initialState = {
  // App metadata
  version: '1.0.0',
  buildNumber: Date.now(),
  environment: 'development',
  
  // UI State
  sidebarCollapsed: false,
  currentRoute: '/',
  breadcrumbs: [],
  
  // Layout & UI preferences
  layout: {
    header: {
      height: 64,
      fixed: true,
      showLogo: true,
      showNavigation: true,
      showUserMenu: true
    },
    sidebar: {
      width: 250,
      collapsedWidth: 64,
      showIcons: true,
      showLabels: true,
      position: 'left' // 'left' | 'right'
    },
    content: {
      padding: 'normal', // 'none' | 'small' | 'normal' | 'large'
      maxWidth: '1200px',
      centered: true
    },
    footer: {
      show: true,
      height: 48,
      fixed: false
    }
  },
  
  // App preferences
  preferences: {
    autoSave: true,
    autoSync: true,
    showTutorials: true,
    showTooltips: true,
    confirmActions: true,
    debugMode: false,
    
    // Performance preferences
    enableAnimations: true,
    lazyLoadComponents: true,
    enableServiceWorker: true,
    
    // Accessibility preferences
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    keyboardNavigation: true
  },
  
  // Notifications & Alerts
  notifications: [],
  alerts: [],
  
  // Modal & Dialog state
  modals: {
    activeModal: null,
    modalStack: [],
    settings: {
      open: false,
      activeTab: 'general'
    },
    about: {
      open: false
    },
    help: {
      open: false
    }
  },
  
  // Loading states
  loading: {
    global: false,
    components: {},
    operations: {}
  },
  
  // Error handling
  errors: {
    global: null,
    components: {},
    operations: {}
  },
  
  // Performance monitoring
  performance: {
    pageLoadTime: null,
    renderTimes: {},
    memoryUsage: null,
    networkStatus: 'online', // 'online' | 'offline' | 'slow'
    lastPerformanceCheck: null
  },
  
  // Feature flags
  features: {
    enableBetaFeatures: false,
    enableAdvancedThemes: true,
    enableAnalytics: true,
    enablePWA: true,
    enableOfflineMode: false
  },
  
  // Persistence
  lastSaved: null,
  lastLoaded: null,
  autoSaveEnabled: true,
  isDirty: false
};

const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    // UI State management
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
      state.isDirty = true;
    },
    
    setCurrentRoute: (state, action) => {
      state.currentRoute = action.payload;
      
      // Update breadcrumbs based on route
      const routeParts = action.payload.split('/').filter(Boolean);
      state.breadcrumbs = routeParts.map((part, index) => ({
        label: part.charAt(0).toUpperCase() + part.slice(1),
        path: '/' + routeParts.slice(0, index + 1).join('/'),
        active: index === routeParts.length - 1
      }));
    },
    
    updateLayout: (state, action) => {
      state.layout = { ...state.layout, ...action.payload };
      state.isDirty = true;
    },
    
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
      state.isDirty = true;
      
      // Auto-save if enabled
      if (state.autoSaveEnabled) {
        // This will trigger persistence in the component
      }
    },
    
    // Notifications & Alerts
    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        type: action.payload.type || 'info', // 'info' | 'success' | 'warning' | 'error'
        title: action.payload.title,
        message: action.payload.message,
        duration: action.payload.duration || 5000,
        timestamp: Date.now(),
        persistent: action.payload.persistent || false
      };
      
      state.notifications.unshift(notification);
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    addAlert: (state, action) => {
      const alert = {
        id: Date.now().toString(),
        type: action.payload.type || 'info',
        message: action.payload.message,
        timestamp: Date.now(),
        dismissible: action.payload.dismissible !== false
      };
      
      state.alerts.push(alert);
    },
    
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(a => a.id !== action.payload);
    },
    
    // Modal management
    openModal: (state, action) => {
      const { modalName, props } = action.payload;
      
      if (state.modals.activeModal) {
        state.modals.modalStack.push(state.modals.activeModal);
      }
      
      state.modals.activeModal = { name: modalName, props };
    },
    
    closeModal: (state) => {
      if (state.modals.modalStack.length > 0) {
        state.modals.activeModal = state.modals.modalStack.pop();
      } else {
        state.modals.activeModal = null;
      }
    },
    
    closeAllModals: (state) => {
      state.modals.activeModal = null;
      state.modals.modalStack = [];
    },
    
    toggleSettingsModal: (state, action) => {
      state.modals.settings.open = !state.modals.settings.open;
      if (action.payload?.tab) {
        state.modals.settings.activeTab = action.payload.tab;
      }
    },
    
    // Loading states
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    
    setComponentLoading: (state, action) => {
      const { component, loading } = action.payload;
      state.loading.components[component] = loading;
    },
    
    setOperationLoading: (state, action) => {
      const { operation, loading } = action.payload;
      state.loading.operations[operation] = loading;
    },
    
    // Error handling
    setGlobalError: (state, action) => {
      state.errors.global = {
        message: action.payload.message,
        stack: action.payload.stack,
        timestamp: Date.now()
      };
    },
    
    clearGlobalError: (state) => {
      state.errors.global = null;
    },
    
    setComponentError: (state, action) => {
      const { component, error } = action.payload;
      state.errors.components[component] = {
        message: error.message,
        timestamp: Date.now()
      };
    },
    
    clearComponentError: (state, action) => {
      const component = action.payload;
      delete state.errors.components[component];
    },
    
    // Performance monitoring
    updatePerformance: (state, action) => {
      state.performance = { ...state.performance, ...action.payload };
      state.performance.lastPerformanceCheck = Date.now();
    },
    
    setNetworkStatus: (state, action) => {
      state.performance.networkStatus = action.payload;
    },
    
    // Feature flags
    toggleFeature: (state, action) => {
      const { feature, enabled } = action.payload;
      if (state.features.hasOwnProperty(feature)) {
        state.features[feature] = enabled;
        state.isDirty = true;
      }
    },
    
    updateFeatures: (state, action) => {
      state.features = { ...state.features, ...action.payload };
      state.isDirty = true;
    },
    
    // Persistence
    setDirty: (state, action) => {
      state.isDirty = action.payload;
    },
    
    setAutoSave: (state, action) => {
      state.autoSaveEnabled = action.payload;
    },
    
    // Utility actions
    resetAppState: (state) => {
      // Reset to initial state but preserve some settings
      const preservedSettings = {
        preferences: state.preferences,
        features: state.features,
        layout: state.layout
      };
      
      Object.assign(state, initialState, preservedSettings);
      state.isDirty = true;
    },
    
    getAppSummary: (state) => {
      return {
        version: state.version,
        environment: state.environment,
        performance: {
          networkStatus: state.performance.networkStatus,
          lastCheck: state.performance.lastPerformanceCheck
        },
        ui: {
          route: state.currentRoute,
          sidebarCollapsed: state.sidebarCollapsed,
          activeModal: state.modals.activeModal?.name
        },
        notifications: state.notifications.length,
        alerts: state.alerts.length,
        errors: {
          global: !!state.errors.global,
          components: Object.keys(state.errors.components).length
        }
      };
    }
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(persistAppState.pending, (state) => {
        state.loading.operations.persist = true;
      })
      .addCase(persistAppState.fulfilled, (state, action) => {
        state.loading.operations.persist = false;
        state.lastSaved = action.payload.timestamp;
        state.isDirty = false;
      })
      .addCase(persistAppState.rejected, (state, action) => {
        state.loading.operations.persist = false;
        state.errors.operations.persist = action.error.message;
      })
      .addCase(loadPersistedState.fulfilled, (state, action) => {
        if (action.payload) {
          // Merge persisted state carefully
          if (action.payload.appState) {
            Object.assign(state, action.payload.appState);
          }
          state.lastLoaded = Date.now();
        }
      });
  }
});

export const {
  setSidebarCollapsed,
  setCurrentRoute,
  updateLayout,
  updatePreferences,
  addNotification,
  removeNotification,
  clearAllNotifications,
  addAlert,
  removeAlert,
  openModal,
  closeModal,
  closeAllModals,
  toggleSettingsModal,
  setGlobalLoading,
  setComponentLoading,
  setOperationLoading,
  setGlobalError,
  clearGlobalError,
  setComponentError,
  clearComponentError,
  updatePerformance,
  setNetworkStatus,
  toggleFeature,
  updateFeatures,
  setDirty,
  setAutoSave,
  resetAppState,
  getAppSummary
} = appStateSlice.actions;

export default appStateSlice.reducer;