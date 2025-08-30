import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for centralized authentication
export const authenticateUser = createAsyncThunk(
  'globalUser/authenticate',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const data = await response.json();
      
      // Store token globally
      localStorage.setItem('global_token', data.token);
      
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'globalUser/logout',
  async (_, { dispatch }) => {
    localStorage.removeItem('global_token');
    
    // Broadcast logout to all micro-frontends
    if (typeof window !== 'undefined' && window.__GLOBAL_STATE_MANAGER__) {
      window.__GLOBAL_STATE_MANAGER__.dispatch({
        type: 'user/globalLogout',
        source: 'shell-vue',
        broadcast: true
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
  remoteUsers: {
    react: { isAuthenticated: false, user: null },
    vue: { isAuthenticated: false, user: null },
    angular: { isAuthenticated: false, user: null },
    typescript: { isAuthenticated: false, user: null },
    javascript: { isAuthenticated: false, user: null }
  },
  globalPermissions: [],
  globalPreferences: {
    theme: 'light',
    language: 'en',
    notifications: true,
    privacy: 'standard',
    dataSharing: false
  },
  sessionInfo: {
    startTime: null,
    lastActivity: null,
    activeRemotes: [],
    totalInteractions: 0
  },
  synchronizedAt: null
};

const globalUserSlice = createSlice({
  name: 'globalUser',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
      state.sessionInfo.startTime = Date.now();
      state.sessionInfo.lastActivity = Date.now();
    },
    updateGlobalPreferences: (state, action) => {
      state.globalPreferences = { ...state.globalPreferences, ...action.payload };
      
      // Broadcast preference changes to all remotes
      if (typeof window !== 'undefined' && window.__GLOBAL_STATE_MANAGER__) {
        window.__GLOBAL_STATE_MANAGER__.dispatch({
          type: 'preferences/globalUpdate',
          payload: state.globalPreferences,
          source: 'shell-vue',
          broadcast: true
        });
      }
    },
    addGlobalPermission: (state, action) => {
      if (!state.globalPermissions.includes(action.payload)) {
        state.globalPermissions.push(action.payload);
      }
    },
    removeGlobalPermission: (state, action) => {
      state.globalPermissions = state.globalPermissions.filter(p => p !== action.payload);
    },
    syncRemoteUser: (state, action) => {
      const { remoteName, userState } = action.payload;
      if (state.remoteUsers.hasOwnProperty(remoteName)) {
        state.remoteUsers[remoteName] = userState;
        state.synchronizedAt = Date.now();
        
        // Update active remotes list
        if (userState.isAuthenticated && !state.sessionInfo.activeRemotes.includes(remoteName)) {
          state.sessionInfo.activeRemotes.push(remoteName);
        } else if (!userState.isAuthenticated) {
          state.sessionInfo.activeRemotes = state.sessionInfo.activeRemotes.filter(r => r !== remoteName);
        }
      }
    },
    syncAllRemoteUsers: (state, action) => {
      Object.assign(state.remoteUsers, action.payload);
      state.synchronizedAt = Date.now();
      
      // Update active remotes
      state.sessionInfo.activeRemotes = Object.keys(action.payload)
        .filter(key => action.payload[key].isAuthenticated);
    },
    incrementInteractions: (state, action) => {
      state.sessionInfo.totalInteractions += 1;
      state.sessionInfo.lastActivity = Date.now();
      
      // Track which remote generated the interaction
      if (action.payload?.source) {
        const source = action.payload.source;
        if (!state.sessionInfo.activeRemotes.includes(source)) {
          state.sessionInfo.activeRemotes.push(source);
        }
      }
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.globalPermissions = [];
      state.sessionInfo = {
        startTime: null,
        lastActivity: null,
        activeRemotes: [],
        totalInteractions: 0
      };
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Global user operations
    loginToAllRemotes: (state, action) => {
      const userData = action.payload;
      state.currentUser = userData;
      state.isAuthenticated = true;
      
      // This will be handled by middleware to broadcast to all remotes
      state.sessionInfo.startTime = Date.now();
      state.sessionInfo.lastActivity = Date.now();
    },
    logoutFromAllRemotes: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.globalPermissions = [];
      
      // Reset remote users
      Object.keys(state.remoteUsers).forEach(key => {
        state.remoteUsers[key] = { isAuthenticated: false, user: null };
      });
      
      state.sessionInfo = {
        startTime: null,
        lastActivity: null,
        activeRemotes: [],
        totalInteractions: 0
      };
    },
    // Utility reducers
    getAuthenticationStatus: (state) => {
      // Computed selector for overall authentication status
      const globalAuth = state.isAuthenticated;
      const remoteAuth = Object.values(state.remoteUsers).some(remote => remote.isAuthenticated);
      
      return {
        global: globalAuth,
        anyRemote: remoteAuth,
        allRemotes: Object.values(state.remoteUsers).every(remote => remote.isAuthenticated),
        activeCount: state.sessionInfo.activeRemotes.length
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(authenticateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authenticateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.sessionInfo.startTime = Date.now();
        state.sessionInfo.lastActivity = Date.now();
      })
      .addCase(authenticateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.globalPermissions = [];
        state.sessionInfo = {
          startTime: null,
          lastActivity: null,
          activeRemotes: [],
          totalInteractions: 0
        };
      });
  }
});

export const { 
  setUser, 
  updateGlobalPreferences, 
  addGlobalPermission,
  removeGlobalPermission,
  syncRemoteUser,
  syncAllRemoteUsers,
  incrementInteractions,
  clearUser, 
  setError,
  clearError,
  loginToAllRemotes,
  logoutFromAllRemotes,
  getAuthenticationStatus
} = globalUserSlice.actions;

export default globalUserSlice.reducer;