import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CounterState {
  value: number;
  incrementBy: number;
  history: Array<{
    action: string;
    value: number;
    timestamp: number;
    source: string;
    amount?: number;
  }>;
  isLoading: boolean;
}

const initialState: CounterState = {
  value: 0,
  incrementBy: 3,
  history: [],
  isLoading: false,
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
        source: 'angular-remote'
      });
    },
    decrement: (state) => {
      state.value -= state.incrementBy;
      state.history.push({
        action: 'decrement',
        value: state.value,
        timestamp: Date.now(),
        source: 'angular-remote'
      });
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
      state.history.push({
        action: 'incrementByAmount',
        value: state.value,
        amount: action.payload,
        timestamp: Date.now(),
        source: 'angular-remote'
      });
    },
    setIncrementBy: (state, action: PayloadAction<number>) => {
      state.incrementBy = action.payload;
    },
    reset: (state) => {
      state.value = 0;
      state.history.push({
        action: 'reset',
        value: 0,
        timestamp: Date.now(),
        source: 'angular-remote'
      });
    },
    setFromGlobal: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
      state.history.push({
        action: 'setFromGlobal',
        value: action.payload,
        timestamp: Date.now(),
        source: 'global-sync'
      });
    },
    multiplyBy: (state, action: PayloadAction<number>) => {
      state.value *= action.payload;
      state.history.push({
        action: 'multiplyBy',
        value: state.value,
        amount: action.payload,
        timestamp: Date.now(),
        source: 'angular-remote'
      });
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  },
});

export const { 
  increment, 
  decrement, 
  incrementByAmount, 
  setIncrementBy, 
  reset, 
  setFromGlobal,
  multiplyBy,
  setLoading
} = counterSlice.actions;

export default counterSlice.reducer;