import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface DataItem {
  id: string;
  name: string;
  value: number;
  category: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface DataState {
  items: DataItem[];
  filteredItems: DataItem[];
  loading: boolean;
  error: string | null;
  filter: {
    category: string | null;
    searchTerm: string;
    sortBy: 'name' | 'value' | 'timestamp';
    sortOrder: 'asc' | 'desc';
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
  };
  statistics: {
    totalItems: number;
    totalValue: number;
    averageValue: number;
    categories: string[];
  };
}

// Async thunk for loading data
export const loadData = createAsyncThunk(
  'data/loadData',
  async (params: { category?: string; limit?: number }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append('category', params.category);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await fetch(`/api/data?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load data');
      }
      
      const data = await response.json();
      return data.items;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveDataItem = createAsyncThunk(
  'data/saveItem',
  async (item: Omit<DataItem, 'id' | 'timestamp'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...item,
          timestamp: Date.now()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save data item');
      }
      
      const data = await response.json();
      return data.item;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState: DataState = {
  items: [
    { id: '1', name: 'Angular Components', value: 25, category: 'Development', timestamp: Date.now() - 86400000 },
    { id: '2', name: 'TypeScript Interfaces', value: 15, category: 'Development', timestamp: Date.now() - 172800000 },
    { id: '3', name: 'RxJS Observables', value: 35, category: 'Development', timestamp: Date.now() - 259200000 },
    { id: '4', name: 'Angular Services', value: 20, category: 'Architecture', timestamp: Date.now() - 345600000 },
    { id: '5', name: 'Unit Tests', value: 45, category: 'Testing', timestamp: Date.now() - 432000000 },
  ],
  filteredItems: [],
  loading: false,
  error: null,
  filter: {
    category: null,
    searchTerm: '',
    sortBy: 'timestamp',
    sortOrder: 'desc',
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
  },
  statistics: {
    totalItems: 0,
    totalValue: 0,
    averageValue: 0,
    categories: [],
  },
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    addDataItem: (state, action: PayloadAction<Omit<DataItem, 'id' | 'timestamp'>>) => {
      const newItem: DataItem = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.items.unshift(newItem);
      dataSlice.caseReducers.updateStatistics(state);
      dataSlice.caseReducers.applyFilters(state);
    },
    updateDataItem: (state, action: PayloadAction<{ id: string; updates: Partial<DataItem> }>) => {
      const { id, updates } = action.payload;
      const index = state.items.findIndex(item => item.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
        dataSlice.caseReducers.updateStatistics(state);
        dataSlice.caseReducers.applyFilters(state);
      }
    },
    removeDataItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      dataSlice.caseReducers.updateStatistics(state);
      dataSlice.caseReducers.applyFilters(state);
    },
    setFilter: (state, action: PayloadAction<Partial<DataState['filter']>>) => {
      state.filter = { ...state.filter, ...action.payload };
      dataSlice.caseReducers.applyFilters(state);
    },
    setPagination: (state, action: PayloadAction<Partial<DataState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearFilters: (state) => {
      state.filter = {
        category: null,
        searchTerm: '',
        sortBy: 'timestamp',
        sortOrder: 'desc',
      };
      dataSlice.caseReducers.applyFilters(state);
    },
    applyFilters: (state) => {
      let filtered = [...state.items];
      
      // Apply category filter
      if (state.filter.category) {
        filtered = filtered.filter(item => item.category === state.filter.category);
      }
      
      // Apply search filter
      if (state.filter.searchTerm) {
        const searchTerm = state.filter.searchTerm.toLowerCase();
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        const aValue = a[state.filter.sortBy];
        const bValue = b[state.filter.sortBy];
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return state.filter.sortOrder === 'asc' ? comparison : -comparison;
      });
      
      state.filteredItems = filtered;
      state.pagination.totalItems = filtered.length;
    },
    updateStatistics: (state) => {
      const items = state.items;
      state.statistics.totalItems = items.length;
      state.statistics.totalValue = items.reduce((sum, item) => sum + item.value, 0);
      state.statistics.averageValue = items.length > 0 ? state.statistics.totalValue / items.length : 0;
      state.statistics.categories = [...new Set(items.map(item => item.category))];
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadData.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        dataSlice.caseReducers.updateStatistics(state);
        dataSlice.caseReducers.applyFilters(state);
      })
      .addCase(loadData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveDataItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveDataItem.fulfilled, (state, action) => {
        state.loading = false;
        const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
        if (existingIndex >= 0) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.unshift(action.payload);
        }
        dataSlice.caseReducers.updateStatistics(state);
        dataSlice.caseReducers.applyFilters(state);
      })
      .addCase(saveDataItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Initialize filtered items and statistics on app start
initialState.filteredItems = [...initialState.items];
initialState.statistics = {
  totalItems: initialState.items.length,
  totalValue: initialState.items.reduce((sum, item) => sum + item.value, 0),
  averageValue: initialState.items.reduce((sum, item) => sum + item.value, 0) / initialState.items.length,
  categories: [...new Set(initialState.items.map(item => item.category))],
};

export const {
  addDataItem,
  updateDataItem,
  removeDataItem,
  setFilter,
  setPagination,
  clearFilters,
  applyFilters,
  updateStatistics,
  setError,
  clearError
} = dataSlice.actions;

export default dataSlice.reducer;