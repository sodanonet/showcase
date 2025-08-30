import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
  step: number;
  history: CounterAction[];
  isAutoIncrementing: boolean;
  autoIncrementInterval: number;
}

interface CounterAction {
  type: string;
  value: number;
  timestamp: number;
  source: string;
  metadata?: any;
}

const initialState: CounterState = {
  value: 0,
  step: 1,
  history: [],
  isAutoIncrementing: false,
  autoIncrementInterval: 1000,
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += state.step;
      state.history.push({
        type: 'increment',
        value: state.value,
        timestamp: Date.now(),
        source: 'ts-remote'
      });
    },
    decrement: (state) => {
      state.value -= state.step;
      state.history.push({
        type: 'decrement',
        value: state.value,
        timestamp: Date.now(),
        source: 'ts-remote'
      });
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
      state.history.push({
        type: 'incrementByAmount',
        value: state.value,
        timestamp: Date.now(),
        source: 'ts-remote',
        metadata: { amount: action.payload }
      });
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
    },
    reset: (state) => {
      state.value = 0;
      state.history.push({
        type: 'reset',
        value: 0,
        timestamp: Date.now(),
        source: 'ts-remote'
      });
    },
    setFromGlobal: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
      state.history.push({
        type: 'setFromGlobal',
        value: action.payload,
        timestamp: Date.now(),
        source: 'global-sync'
      });
    },
    square: (state) => {
      state.value = state.value * state.value;
      state.history.push({
        type: 'square',
        value: state.value,
        timestamp: Date.now(),
        source: 'ts-remote'
      });
    },
    sqrt: (state) => {
      state.value = Math.floor(Math.sqrt(Math.abs(state.value)));
      state.history.push({
        type: 'sqrt',
        value: state.value,
        timestamp: Date.now(),
        source: 'ts-remote'
      });
    },
    setAutoIncrement: (state, action: PayloadAction<boolean>) => {
      state.isAutoIncrementing = action.payload;
    },
    setAutoIncrementInterval: (state, action: PayloadAction<number>) => {
      state.autoIncrementInterval = action.payload;
    },
    clearHistory: (state) => {
      state.history = [];
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
  square,
  sqrt,
  setAutoIncrement,
  setAutoIncrementInterval,
  clearHistory
} = counterSlice.actions;

export default counterSlice.reducer;