import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  step: 2,
  history: [],
  operations: {
    additions: 0,
    subtractions: 0,
    resets: 0
  }
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += state.step;
      state.operations.additions++;
      state.history.push({
        action: 'increment',
        value: state.value,
        timestamp: Date.now(),
        source: 'js-remote'
      });
    },
    decrement: (state) => {
      state.value -= state.step;
      state.operations.subtractions++;
      state.history.push({
        action: 'decrement',
        value: state.value,
        timestamp: Date.now(),
        source: 'js-remote'
      });
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
      state.operations.additions++;
      state.history.push({
        action: 'incrementByAmount',
        value: state.value,
        amount: action.payload,
        timestamp: Date.now(),
        source: 'js-remote'
      });
    },
    setStep: (state, action) => {
      state.step = action.payload;
    },
    reset: (state) => {
      state.value = 0;
      state.operations.resets++;
      state.history.push({
        action: 'reset',
        value: 0,
        timestamp: Date.now(),
        source: 'js-remote'
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
    fibonacci: (state) => {
      // Calculate fibonacci sequence step
      const fib = (n) => n <= 1 ? n : fib(n - 1) + fib(n - 2);
      const fibValue = fib(Math.abs(state.value) % 10); // Limit to prevent infinite calculation
      
      state.value = fibValue;
      state.history.push({
        action: 'fibonacci',
        value: fibValue,
        timestamp: Date.now(),
        source: 'js-remote'
      });
    },
    randomize: (state) => {
      state.value = Math.floor(Math.random() * 100);
      state.history.push({
        action: 'randomize',
        value: state.value,
        timestamp: Date.now(),
        source: 'js-remote'
      });
    }
  },
});

export const { 
  increment, 
  decrement, 
  incrementByAmount, 
  setStep, 
  reset, 
  setFromGlobal,
  fibonacci,
  randomize
} = counterSlice.actions;

export default counterSlice.reducer;