import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  incrementBy: 2,
  history: [],
  multiplier: 1,
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += (state.incrementBy * state.multiplier);
      state.history.push({
        action: 'increment',
        value: state.value,
        timestamp: Date.now(),
        source: 'vue-remote'
      });
    },
    decrement: (state) => {
      state.value -= (state.incrementBy * state.multiplier);
      state.history.push({
        action: 'decrement',
        value: state.value,
        timestamp: Date.now(),
        source: 'vue-remote'
      });
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
      state.history.push({
        action: 'incrementByAmount',
        value: state.value,
        amount: action.payload,
        timestamp: Date.now(),
        source: 'vue-remote'
      });
    },
    setIncrementBy: (state, action) => {
      state.incrementBy = action.payload;
    },
    setMultiplier: (state, action) => {
      state.multiplier = action.payload;
    },
    reset: (state) => {
      state.value = 0;
      state.history.push({
        action: 'reset',
        value: 0,
        timestamp: Date.now(),
        source: 'vue-remote'
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
    },
    doubleValue: (state) => {
      state.value *= 2;
      state.history.push({
        action: 'doubleValue',
        value: state.value,
        timestamp: Date.now(),
        source: 'vue-remote'
      });
    }
  },
});

export const { 
  increment, 
  decrement, 
  incrementByAmount, 
  setIncrementBy, 
  setMultiplier,
  reset, 
  setFromGlobal,
  doubleValue
} = counterSlice.actions;

export default counterSlice.reducer;