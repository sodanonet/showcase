import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  id: string | null;
  username: string | null;
  email: string | null;
  isAuthenticated: boolean;
  preferences: {
    theme: string;
    language: string;
  };
}

const initialState: UserState = {
  id: null,
  username: null,
  email: null,
  isAuthenticated: false,
  preferences: {
    theme: 'light',
    language: 'en'
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id: string; username: string; email: string }>) => {
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.id = null;
      state.username = null;
      state.email = null;
      state.isAuthenticated = false;
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    }
  }
});

export const { setUser, clearUser, updatePreferences } = userSlice.actions;
export default userSlice.reducer;