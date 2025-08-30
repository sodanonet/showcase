import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  layout: 'default' | 'compact' | 'expanded';
  animations: boolean;
  reducedMotion: boolean;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  spacing: 'compact' | 'comfortable' | 'spacious';
  sidebar: 'expanded' | 'collapsed' | 'hidden';
  density: 'comfortable' | 'compact' | 'spacious';
}

const initialState: ThemeState = {
  mode: 'light',
  primaryColor: '#1976d2', // Angular blue
  secondaryColor: '#dc143c', // Angular red
  accentColor: '#ffc107', // Angular yellow
  fontSize: 'medium',
  layout: 'default',
  animations: true,
  reducedMotion: false,
  borderRadius: 'medium',
  spacing: 'comfortable',
  sidebar: 'expanded',
  density: 'comfortable',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.mode = action.payload;
      
      // Apply system theme if auto
      if (action.payload === 'auto' && typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        state.mode = prefersDark ? 'dark' : 'light';
      }
      
      // Sync with global theme manager
      if (typeof window !== 'undefined' && (window as any).__GLOBAL_STATE_MANAGER__) {
        (window as any).__GLOBAL_STATE_MANAGER__.dispatch({
          type: 'theme/globalThemeChange',
          payload: { mode: state.mode },
          source: 'angular-remote'
        });
      }
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
    },
    setSecondaryColor: (state, action: PayloadAction<string>) => {
      state.secondaryColor = action.payload;
    },
    setAccentColor: (state, action: PayloadAction<string>) => {
      state.accentColor = action.payload;
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload;
    },
    setLayout: (state, action: PayloadAction<'default' | 'compact' | 'expanded'>) => {
      state.layout = action.payload;
    },
    setBorderRadius: (state, action: PayloadAction<'none' | 'small' | 'medium' | 'large'>) => {
      state.borderRadius = action.payload;
    },
    setSpacing: (state, action: PayloadAction<'compact' | 'comfortable' | 'spacious'>) => {
      state.spacing = action.payload;
    },
    setSidebar: (state, action: PayloadAction<'expanded' | 'collapsed' | 'hidden'>) => {
      state.sidebar = action.payload;
    },
    setDensity: (state, action: PayloadAction<'comfortable' | 'compact' | 'spacious'>) => {
      state.density = action.payload;
    },
    toggleAnimations: (state) => {
      state.animations = !state.animations;
    },
    setReducedMotion: (state, action: PayloadAction<boolean>) => {
      state.reducedMotion = action.payload;
    },
    applyTheme: (state, action: PayloadAction<Partial<ThemeState>>) => {
      return { ...state, ...action.payload };
    },
    resetTheme: () => initialState,
    applyAngularPreset: (state, action: PayloadAction<'material' | 'bootstrap' | 'custom' | 'dark-material'>) => {
      const presets = {
        material: {
          primaryColor: '#1976d2',
          secondaryColor: '#dc143c',
          accentColor: '#ffc107',
          borderRadius: 'small' as const,
        },
        bootstrap: {
          primaryColor: '#007bff',
          secondaryColor: '#6c757d',
          accentColor: '#28a745',
          borderRadius: 'small' as const,
        },
        custom: {
          primaryColor: '#9c27b0',
          secondaryColor: '#e91e63',
          accentColor: '#00bcd4',
          borderRadius: 'medium' as const,
        },
        'dark-material': {
          mode: 'dark' as const,
          primaryColor: '#bb86fc',
          secondaryColor: '#03dac6',
          accentColor: '#cf6679',
          borderRadius: 'small' as const,
        }
      };
      
      if (presets[action.payload]) {
        Object.assign(state, presets[action.payload]);
      }
    }
  },
});

export const {
  setThemeMode,
  setPrimaryColor,
  setSecondaryColor,
  setAccentColor,
  setFontSize,
  setLayout,
  setBorderRadius,
  setSpacing,
  setSidebar,
  setDensity,
  toggleAnimations,
  setReducedMotion,
  applyTheme,
  resetTheme,
  applyAngularPreset
} = themeSlice.actions;

export default themeSlice.reducer;