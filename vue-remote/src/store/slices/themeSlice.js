import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'light', // 'light' | 'dark' | 'auto'
  primaryColor: '#42b883', // Vue green
  secondaryColor: '#35495e', // Vue dark blue
  accentColor: '#ff6b6b',
  fontSize: 'medium', // 'small' | 'medium' | 'large'
  layout: 'default', // 'default' | 'compact' | 'expanded'
  animations: true,
  reducedMotion: false,
  borderRadius: 'medium', // 'small' | 'medium' | 'large' | 'none'
  spacing: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
  backgroundPattern: 'none' // 'none' | 'dots' | 'grid' | 'waves'
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action) => {
      state.mode = action.payload;
      
      // Apply system theme if auto
      if (action.payload === 'auto' && typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        state.mode = prefersDark ? 'dark' : 'light';
      }
      
      // Sync with global theme manager
      if (typeof window !== 'undefined' && window.__GLOBAL_STATE_MANAGER__) {
        window.__GLOBAL_STATE_MANAGER__.dispatch({
          type: 'theme/globalThemeChange',
          payload: { mode: state.mode },
          source: 'vue-remote'
        });
      }
    },
    setPrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
    },
    setSecondaryColor: (state, action) => {
      state.secondaryColor = action.payload;
    },
    setAccentColor: (state, action) => {
      state.accentColor = action.payload;
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
    setLayout: (state, action) => {
      state.layout = action.payload;
    },
    setBorderRadius: (state, action) => {
      state.borderRadius = action.payload;
    },
    setSpacing: (state, action) => {
      state.spacing = action.payload;
    },
    setBackgroundPattern: (state, action) => {
      state.backgroundPattern = action.payload;
    },
    toggleAnimations: (state) => {
      state.animations = !state.animations;
    },
    setReducedMotion: (state, action) => {
      state.reducedMotion = action.payload;
    },
    applyTheme: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetTheme: () => initialState,
    applyPreset: (state, action) => {
      const presets = {
        vue: {
          primaryColor: '#42b883',
          secondaryColor: '#35495e',
          accentColor: '#ff6b6b'
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
        },
        forest: {
          primaryColor: '#2d5a27',
          secondaryColor: '#40826d',
          accentColor: '#95c623'
        }
      };
      
      if (presets[action.payload]) {
        Object.assign(state, presets[action.payload]);
      }
    }
  }
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
  setBackgroundPattern,
  toggleAnimations,
  setReducedMotion,
  applyTheme,
  resetTheme,
  applyPreset
} = themeSlice.actions;

export default themeSlice.reducer;