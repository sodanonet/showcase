import { configureStore } from '@reduxjs/toolkit';
import counterSlice from './slices/counterSlice';
import userSlice from './slices/userSlice';
import themeSlice from './slices/themeSlice';
import todoSlice from './slices/todoSlice';

// Global store reference for cross-micro-frontend communication
let globalStore = null;

export const createStore = (preloadedState = {}) => {
  const store = configureStore({
    reducer: {
      counter: counterSlice,
      user: userSlice,
      theme: themeSlice,
      todos: todoSlice,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Allow non-serializable values for cross-app communication
      }),
  });

  // Expose store globally for Module Federation communication
  if (typeof window !== 'undefined') {
    window.__VUE_REMOTE_STORE__ = store;
    globalStore = store;
  }

  return store;
};

export const getStore = () => globalStore;

export default createStore();