import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  aggregatedValue: 0, // Sum of all remote counters
  remoteCounters: {
    react: 0,
    vue: 0,
    angular: 0,
    typescript: 0,
    javascript: 0
  },
  synchronizedAt: null,
  history: [],
  autoSync: true,
  syncInterval: 5000
};

const globalCounterSlice = createSlice({
  name: 'globalCounter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
      state.history.push({
        action: 'increment',
        value: state.value,
        timestamp: Date.now(),
        source: 'shell-vue'
      });
    },
    decrement: (state) => {
      state.value -= 1;
      state.history.push({
        action: 'decrement',
        value: state.value,
        timestamp: Date.now(),
        source: 'shell-vue'
      });
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
      state.history.push({
        action: 'incrementByAmount',
        value: state.value,
        amount: action.payload,
        timestamp: Date.now(),
        source: 'shell-vue'
      });
    },
    reset: (state) => {
      state.value = 0;
      state.history.push({
        action: 'reset',
        value: 0,
        timestamp: Date.now(),
        source: 'shell-vue'
      });
    },
    syncFromRemote: (state, action) => {
      const { remoteName, value } = action.payload;
      if (state.remoteCounters.hasOwnProperty(remoteName)) {
        state.remoteCounters[remoteName] = value;
        state.synchronizedAt = Date.now();
        
        // Calculate aggregated value
        state.aggregatedValue = state.value + Object.values(state.remoteCounters)
          .reduce((sum, val) => sum + (val || 0), 0);
      }
    },
    syncAllRemotes: (state, action) => {
      Object.assign(state.remoteCounters, action.payload);
      state.synchronizedAt = Date.now();
      
      // Calculate aggregated value
      state.aggregatedValue = state.value + Object.values(state.remoteCounters)
        .reduce((sum, val) => sum + (val || 0), 0);
    },
    broadcastToRemotes: (state, action) => {
      // This reducer triggers broadcasting to remote stores
      state.history.push({
        action: 'broadcastToRemotes',
        value: state.value,
        target: action.payload.target || 'all',
        timestamp: Date.now(),
        source: 'shell-vue'
      });
    },
    setAutoSync: (state, action) => {
      state.autoSync = action.payload;
    },
    setSyncInterval: (state, action) => {
      state.syncInterval = action.payload;
    },
    clearHistory: (state) => {
      state.history = [];
    },
    // Global operations that affect all remotes
    incrementAllRemotes: (state) => {
      state.value += 1;
      // This will be handled by middleware to broadcast to remotes
      state.history.push({
        action: 'incrementAllRemotes',
        value: state.value,
        timestamp: Date.now(),
        source: 'shell-vue',
        broadcast: true
      });
    },
    resetAllRemotes: (state) => {
      state.value = 0;
      state.remoteCounters = {
        react: 0,
        vue: 0,
        angular: 0,
        typescript: 0,
        javascript: 0
      };
      state.aggregatedValue = 0;
      
      state.history.push({
        action: 'resetAllRemotes',
        value: 0,
        timestamp: Date.now(),
        source: 'shell-vue',
        broadcast: true
      });
    }
  },
});

export const { 
  increment, 
  decrement, 
  incrementByAmount, 
  reset,
  syncFromRemote,
  syncAllRemotes,
  broadcastToRemotes,
  setAutoSync,
  setSyncInterval,
  clearHistory,
  incrementAllRemotes,
  resetAllRemotes
} = globalCounterSlice.actions;

export default globalCounterSlice.reducer;