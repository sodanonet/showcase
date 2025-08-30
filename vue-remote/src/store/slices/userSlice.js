import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for user profile update
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error('Profile update failed');
      }
      
      const data = await response.json();
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  profile: {
    avatar: null,
    bio: '',
    location: '',
    website: ''
  },
  preferences: {
    language: 'en',
    notifications: true,
    theme: 'light',
    emailUpdates: false,
    privacy: 'public'
  },
  activity: {
    lastLogin: null,
    todosCreated: 0,
    sessionsCount: 0
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
      if (action.payload) {
        state.activity.lastLogin = Date.now();
        state.activity.sessionsCount++;
      }
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
      
      // Sync theme changes with global state
      if (action.payload.theme && typeof window !== 'undefined' && window.__GLOBAL_STATE_MANAGER__) {
        window.__GLOBAL_STATE_MANAGER__.dispatch({
          type: 'theme/globalThemeChange',
          payload: { mode: action.payload.theme },
          source: 'vue-remote'
        });
      }
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    incrementTodosCreated: (state) => {
      state.activity.todosCreated++;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.profile = initialState.profile;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    simulateLogin: (state, action) => {
      state.currentUser = {
        id: 'vue-demo-user',
        username: 'vueuser',
        email: 'demo@vue-remote.com',
        role: 'user',
        ...action.payload
      };
      state.isAuthenticated = true;
      state.activity.lastLogin = Date.now();
      state.activity.sessionsCount++;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = { ...state.currentUser, ...action.payload };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setUser, 
  updatePreferences, 
  updateProfile,
  incrementTodosCreated,
  clearUser, 
  setError,
  clearError,
  simulateLogin
} = userSlice.actions;

export default userSlice.reducer;