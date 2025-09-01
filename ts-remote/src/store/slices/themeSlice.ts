import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ThemeState {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'comfortable' | 'spacious';
}

const initialState: ThemeState = {
  mode: 'light',
  primaryColor: '#007bff',
  secondaryColor: '#6c757d',
  fontSize: 'medium',
  spacing: 'comfortable'
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.mode = action.payload;
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
    },
    setSecondaryColor: (state, action: PayloadAction<string>) => {
      state.secondaryColor = action.payload;
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload;
    },
    setSpacing: (state, action: PayloadAction<'compact' | 'comfortable' | 'spacious'>) => {
      state.spacing = action.payload;
    },
    resetTheme: () => initialState
  }
});

export const { 
  setThemeMode, 
  setPrimaryColor, 
  setSecondaryColor, 
  setFontSize, 
  setSpacing, 
  resetTheme 
} = themeSlice.actions;

export default themeSlice.reducer;