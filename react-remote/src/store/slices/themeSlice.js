import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'light', // 'light' | 'dark' | 'auto'
  primaryColor: '#3498db',
  secondaryColor: '#2ecc71',
  fontSize: 'medium', // 'small' | 'medium' | 'large'
  layout: 'default', // 'default' | 'compact' | 'expanded'
  animations: true,
  reducedMotion: false
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action) => {
      state.mode = action.payload;
      // Sync with global theme manager
      if (typeof window !== 'undefined' && window.__GLOBAL_STATE_MANAGER__) {
        window.__GLOBAL_STATE_MANAGER__.dispatch({
          type: 'theme/globalThemeChange',
          payload: { mode: action.payload },
          source: 'react-remote'
        });
      }
    },
    setPrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
    },
    setSecondaryColor: (state, action) => {
      state.secondaryColor = action.payload;
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
    setLayout: (state, action) => {
      state.layout = action.payload;
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
    resetTheme: () => initialState
  }
});

export const {
  setThemeMode,
  setPrimaryColor,
  setSecondaryColor,
  setFontSize,
  setLayout,
  toggleAnimations,
  setReducedMotion,
  applyTheme,
  resetTheme
} = themeSlice.actions;

export default themeSlice.reducer;