import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counter.slice';
import userReducer from './slices/user.slice';
import themeReducer from './slices/theme.slice';
import dataReducer from './slices/data.slice';

// Global store reference for cross-micro-frontend communication
let globalStore: any = null;

export const createStore = (preloadedState: any = {}) => {
  const store = configureStore({
    reducer: {
      counter: counterReducer,
      user: userReducer,
      theme: themeReducer,
      data: dataReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Allow non-serializable values for cross-app communication
      }),
  });

  // Expose store globally for Module Federation communication
  if (typeof window !== 'undefined') {
    (window as any).__ANGULAR_REMOTE_STORE__ = store;
    globalStore = store;
  }

  return store;
};

export const getStore = () => globalStore;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const store = createStore();
export default store;