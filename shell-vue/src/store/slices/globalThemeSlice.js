import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'light', // 'light' | 'dark' | 'auto' | 'custom'
  primaryColor: '#42b883', // Vue green as default
  secondaryColor: '#35495e',
  accentColor: '#ff6b6b',
  backgroundColor: '#ffffff',
  textColor: '#2c3e50',
  
  // Global theme settings that apply to all micro-frontends
  globalSettings: {
    fontSize: 'medium', // 'small' | 'medium' | 'large'
    fontFamily: 'system-ui',
    borderRadius: 'medium', // 'none' | 'small' | 'medium' | 'large'
    spacing: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
    animations: true,
    reducedMotion: false,
    highContrast: false
  },
  
  // Remote theme states
  remoteThemes: {
    react: { mode: 'light', synced: false },
    vue: { mode: 'light', synced: false },
    angular: { mode: 'light', synced: false },
    typescript: { mode: 'light', synced: false },
    javascript: { mode: 'light', synced: false }
  },
  
  // Theme presets
  presets: {
    vue: {
      primaryColor: '#42b883',
      secondaryColor: '#35495e',
      accentColor: '#ff6b6b'
    },
    react: {
      primaryColor: '#61dafb',
      secondaryColor: '#282c34',
      accentColor: '#f7df1e'
    },
    angular: {
      primaryColor: '#dd0031',
      secondaryColor: '#1976d2',
      accentColor: '#ffc107'
    },
    dark: {
      mode: 'dark',
      primaryColor: '#bb86fc',
      secondaryColor: '#03dac6',
      accentColor: '#cf6679',
      backgroundColor: '#121212',
      textColor: '#ffffff'
    },
    ocean: {
      primaryColor: '#006994',
      secondaryColor: '#00a8cc',
      accentColor: '#00d4aa'
    },
    sunset: {
      primaryColor: '#ff6b35',
      secondaryColor: '#f7931e',
      accentColor: '#ffcd3c'
    }
  },
  
  // Theme application settings
  autoSync: true,
  syncDelay: 500, // milliseconds
  lastSyncedAt: null,
  
  // Custom CSS variables
  customVariables: {}
};

const globalThemeSlice = createSlice({
  name: 'globalTheme',
  initialState,
  reducers: {
    setThemeMode: (state, action) => {
      state.mode = action.payload;
      
      // Auto-apply system theme if mode is 'auto'
      if (action.payload === 'auto' && typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const actualMode = prefersDark ? 'dark' : 'light';
        
        // Apply dark/light colors based on system preference
        if (actualMode === 'dark' && state.mode === 'auto') {
          Object.assign(state, state.presets.dark);
          state.mode = 'auto'; // Keep auto mode indicator
        }
      }
      
      state.lastSyncedAt = Date.now();
    },
    
    setPrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
      state.lastSyncedAt = Date.now();
    },
    
    setSecondaryColor: (state, action) => {
      state.secondaryColor = action.payload;
      state.lastSyncedAt = Date.now();
    },
    
    setAccentColor: (state, action) => {
      state.accentColor = action.payload;
      state.lastSyncedAt = Date.now();
    },
    
    setBackgroundColor: (state, action) => {
      state.backgroundColor = action.payload;
      state.lastSyncedAt = Date.now();
    },
    
    setTextColor: (state, action) => {
      state.textColor = action.payload;
      state.lastSyncedAt = Date.now();
    },
    
    updateGlobalSettings: (state, action) => {
      state.globalSettings = { ...state.globalSettings, ...action.payload };
      state.lastSyncedAt = Date.now();
    },
    
    applyPreset: (state, action) => {
      const preset = state.presets[action.payload];
      if (preset) {
        Object.assign(state, preset);
        state.lastSyncedAt = Date.now();
      }
    },
    
    syncRemoteTheme: (state, action) => {
      const { remoteName, themeState } = action.payload;
      if (state.remoteThemes.hasOwnProperty(remoteName)) {
        state.remoteThemes[remoteName] = {
          ...themeState,
          synced: true,
          lastSynced: Date.now()
        };
      }
    },
    
    syncAllRemoteThemes: (state, action) => {
      Object.keys(action.payload).forEach(remoteName => {
        if (state.remoteThemes.hasOwnProperty(remoteName)) {
          state.remoteThemes[remoteName] = {
            ...action.payload[remoteName],
            synced: true,
            lastSynced: Date.now()
          };
        }
      });
    },
    
    setAutoSync: (state, action) => {
      state.autoSync = action.payload;
    },
    
    setSyncDelay: (state, action) => {
      state.syncDelay = action.payload;
    },
    
    // Advanced theme operations
    createCustomTheme: (state, action) => {
      const { name, theme } = action.payload;
      state.presets[name] = theme;
    },
    
    updateCustomVariables: (state, action) => {
      state.customVariables = { ...state.customVariables, ...action.payload };
      state.lastSyncedAt = Date.now();
    },
    
    // Global theme operations that affect all remotes
    applyThemeToAllRemotes: (state, action) => {
      const themeData = action.payload;
      Object.assign(state, themeData);
      
      // Mark all remotes as needing sync
      Object.keys(state.remoteThemes).forEach(remoteName => {
        state.remoteThemes[remoteName].synced = false;
      });
      
      state.lastSyncedAt = Date.now();
    },
    
    resetThemeToDefault: (state) => {
      // Reset to initial state but preserve remote sync info
      const remoteThemes = state.remoteThemes;
      Object.assign(state, initialState);
      state.remoteThemes = remoteThemes;
      
      // Mark all remotes as needing sync
      Object.keys(state.remoteThemes).forEach(remoteName => {
        state.remoteThemes[remoteName].synced = false;
      });
      
      state.lastSyncedAt = Date.now();
    },
    
    toggleDarkMode: (state) => {
      const newMode = state.mode === 'light' ? 'dark' : 'light';
      state.mode = newMode;
      
      // Apply appropriate preset
      if (newMode === 'dark') {
        Object.assign(state, state.presets.dark);
        state.mode = 'dark'; // Preserve mode after preset application
      } else {
        // Reset to light theme
        state.primaryColor = '#42b883';
        state.secondaryColor = '#35495e';
        state.backgroundColor = '#ffffff';
        state.textColor = '#2c3e50';
      }
      
      state.lastSyncedAt = Date.now();
    },
    
    // Utility reducers for computed values
    getThemeCSS: (state) => {
      return {
        '--primary-color': state.primaryColor,
        '--secondary-color': state.secondaryColor,
        '--accent-color': state.accentColor,
        '--background-color': state.backgroundColor,
        '--text-color': state.textColor,
        '--font-size': state.globalSettings.fontSize === 'small' ? '14px' : 
                       state.globalSettings.fontSize === 'large' ? '18px' : '16px',
        '--font-family': state.globalSettings.fontFamily,
        '--border-radius': state.globalSettings.borderRadius === 'none' ? '0' :
                          state.globalSettings.borderRadius === 'small' ? '4px' :
                          state.globalSettings.borderRadius === 'large' ? '12px' : '8px',
        '--spacing': state.globalSettings.spacing === 'compact' ? '0.5rem' :
                    state.globalSettings.spacing === 'spacious' ? '1.5rem' : '1rem',
        ...state.customVariables
      };
    },
    
    getSyncStatus: (state) => {
      const totalRemotes = Object.keys(state.remoteThemes).length;
      const syncedRemotes = Object.values(state.remoteThemes).filter(theme => theme.synced).length;
      
      return {
        totalRemotes,
        syncedRemotes,
        syncPercentage: Math.round((syncedRemotes / totalRemotes) * 100),
        lastSyncedAt: state.lastSyncedAt,
        autoSyncEnabled: state.autoSync
      };
    }
  },
});

export const { 
  setThemeMode,
  setPrimaryColor,
  setSecondaryColor,
  setAccentColor,
  setBackgroundColor,
  setTextColor,
  updateGlobalSettings,
  applyPreset,
  syncRemoteTheme,
  syncAllRemoteThemes,
  setAutoSync,
  setSyncDelay,
  createCustomTheme,
  updateCustomVariables,
  applyThemeToAllRemotes,
  resetThemeToDefault,
  toggleDarkMode,
  getThemeCSS,
  getSyncStatus
} = globalThemeSlice.actions;

export default globalThemeSlice.reducer;