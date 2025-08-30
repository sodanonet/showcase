import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  incrementBy: 1,
  history: [],
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += state.incrementBy;
      state.history.push({
        action: 'increment',
        value: state.value,
        timestamp: Date.now(),
        source: 'react-remote'
      });
    },
    decrement: (state) => {
      state.value -= state.incrementBy;
      state.history.push({
        action: 'decrement',
        value: state.value,
        timestamp: Date.now(),
        source: 'react-remote'
      });
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
      state.history.push({
        action: 'incrementByAmount',
        value: state.value,
        amount: action.payload,
        timestamp: Date.now(),
        source: 'react-remote'
      });
    },
    setIncrementBy: (state, action) => {
      state.incrementBy = action.payload;
    },
    reset: (state) => {
      state.value = 0;
      state.history.push({
        action: 'reset',
        value: 0,
        timestamp: Date.now(),
        source: 'react-remote'
      });
    },
    setFromGlobal: (state, action) => {
      state.value = action.payload;
      state.history.push({
        action: 'setFromGlobal',
        value: action.payload,
        timestamp: Date.now(),
        source: 'global-sync'
      });
    }
  },
});

export const { 
  increment, 
  decrement, 
  incrementByAmount, 
  setIncrementBy, 
  reset, 
  setFromGlobal 
} = counterSlice.actions;

export default counterSlice.reducer;