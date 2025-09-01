import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  department?: string;
  avatar?: string;
}

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  permissions: string[];
  preferences: {
    language: string;
    notifications: boolean;
    theme: string;
    autoSave: boolean;
    compactMode: boolean;
  };
  activity: {
    lastLogin: number | null;
    actionsPerformed: number;
    sessionsCount: number;
    timeSpent: number; // in minutes
  };
}

// Async thunk for fetching user permissions
export const fetchUserPermissions = createAsyncThunk(
  'user/fetchPermissions',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }
      
      const data = await response.json();
      return data.permissions;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  permissions: [],
  preferences: {
    language: 'en',
    notifications: true,
    theme: 'light',
    autoSave: true,
    compactMode: false,
  },
  activity: {
    lastLogin: null,
    actionsPerformed: 0,
    sessionsCount: 0,
    timeSpent: 0,
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      state.activity.lastLogin = Date.now();
      state.activity.sessionsCount++;
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
      
      // Sync theme changes with global state
      if (action.payload.theme && typeof window !== 'undefined' && (window as any).__GLOBAL_STATE_MANAGER__) {
        (window as any).__GLOBAL_STATE_MANAGER__.dispatch({
          type: 'theme/globalThemeChange',
          payload: { mode: action.payload.theme },
          source: 'angular-remote'
        });
      }
    },
    incrementActions: (state) => {
      state.activity.actionsPerformed++;
    },
    updateTimeSpent: (state, action: PayloadAction<number>) => {
      state.activity.timeSpent += action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.permissions = [];
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    simulateLogin: (state, action: PayloadAction<Partial<User>>) => {
      state.currentUser = {
        id: 'angular-demo-user',
        username: 'angularuser',
        email: 'demo@angular-remote.com',
        role: 'admin',
        department: 'Engineering',
        ...action.payload
      };
      state.isAuthenticated = true;
      state.activity.lastLogin = Date.now();
      state.activity.sessionsCount++;
      state.permissions = ['read', 'write', 'admin'];
    },
    addPermission: (state, action: PayloadAction<string>) => {
      if (!state.permissions.includes(action.payload)) {
        state.permissions.push(action.payload);
      }
    },
    removePermission: (state, action: PayloadAction<string>) => {
      state.permissions = state.permissions.filter(p => p !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { 
  setUser, 
  updatePreferences, 
  incrementActions,
  updateTimeSpent,
  clearUser, 
  setError,
  clearError,
  simulateLogin,
  addPermission,
  removePermission
} = userSlice.actions;

export default userSlice.reducer;