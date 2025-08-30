import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for user authentication
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { dispatch }) => {
    localStorage.removeItem('token');
    // Notify other micro-frontends about logout
    if (typeof window !== 'undefined' && window.__GLOBAL_STATE_MANAGER__) {
      window.__GLOBAL_STATE_MANAGER__.dispatch({
        type: 'user/globalLogout',
        source: 'react-remote'
      });
    }
    return null;
  }
);

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  preferences: {
    language: 'en',
    notifications: true,
    theme: 'light'
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  }
});

export const { setUser, updatePreferences, clearUser, setError } = userSlice.actions;

export default userSlice.reducer;