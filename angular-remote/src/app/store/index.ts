import { configureStore } from '@reduxjs/toolkit';
import counterSlice from './slices/counter.slice';
import userSlice from './slices/user.slice';
import themeSlice from './slices/theme.slice';
import dataSlice from './slices/data.slice';

// Create store with a simple configuration
const store = configureStore({
  reducer: {
    counter: counterSlice,
    user: userSlice,
    theme: themeSlice,
    data: dataSlice,
  }
});

// Export store and types
export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Global store reference for cross-micro-frontend communication
let globalStore: any = store;

if (typeof window !== 'undefined') {
  (window as any).__ANGULAR_REMOTE_STORE__ = store;
}

export const getStore = () => globalStore;
export { store };