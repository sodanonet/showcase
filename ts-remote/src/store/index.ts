import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';
import userReducer from './slices/userSlice';
import themeReducer from './slices/themeSlice';
import componentReducer from './slices/componentSlice';

// Global store reference for cross-micro-frontend communication
let globalStore: any = null;

// Create store directly 
const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
    theme: themeReducer,
    components: componentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allow non-serializable values for cross-app communication
    }),
});

// Expose store globally for Module Federation communication
if (typeof window !== 'undefined') {
  (window as any).__TS_REMOTE_STORE__ = store;
  globalStore = store;
}

export const getStore = () => globalStore;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const createStore = (preloadedState?: any) => {
  return store;
};

export { store };
export default store;