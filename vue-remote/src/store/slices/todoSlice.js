import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for loading todos from API
export const loadTodos = createAsyncThunk(
  'todos/loadTodos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/todos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load todos');
      }
      
      const data = await response.json();
      return data.todos;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveTodo = createAsyncThunk(
  'todos/saveTodo',
  async (todo, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(todo)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save todo');
      }
      
      const data = await response.json();
      return data.todo;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [
    { id: 1, text: 'Learn Vue 3', completed: true, priority: 'high' },
    { id: 2, text: 'Implement Redux in Vue', completed: false, priority: 'medium' },
    { id: 3, text: 'Build micro-frontend', completed: false, priority: 'high' },
  ],
  filter: 'all', // 'all', 'active', 'completed'
  loading: false,
  error: null,
  stats: {
    total: 0,
    completed: 0,
    active: 0
  }
};

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: (state, action) => {
      const newTodo = {
        id: Date.now(),
        text: action.payload.text,
        completed: false,
        priority: action.payload.priority || 'medium',
        createdAt: Date.now(),
        source: 'vue-remote'
      };
      state.items.unshift(newTodo);
      state.stats.total++;
      state.stats.active++;
    },
    toggleTodo: (state, action) => {
      const todo = state.items.find(item => item.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
        if (todo.completed) {
          state.stats.completed++;
          state.stats.active--;
        } else {
          state.stats.completed--;
          state.stats.active++;
        }
      }
    },
    removeTodo: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload);
      if (index !== -1) {
        const todo = state.items[index];
        state.items.splice(index, 1);
        state.stats.total--;
        if (todo.completed) {
          state.stats.completed--;
        } else {
          state.stats.active--;
        }
      }
    },
    updateTodo: (state, action) => {
      const { id, updates } = action.payload;
      const todo = state.items.find(item => item.id === id);
      if (todo) {
        Object.assign(todo, updates);
      }
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    clearCompleted: (state) => {
      const completedCount = state.items.filter(item => item.completed).length;
      state.items = state.items.filter(item => !item.completed);
      state.stats.total -= completedCount;
      state.stats.completed = 0;
    },
    markAllCompleted: (state) => {
      const activeCount = state.items.filter(item => !item.completed).length;
      state.items.forEach(item => {
        item.completed = true;
      });
      state.stats.completed = state.stats.total;
      state.stats.active = 0;
    },
    updateStats: (state) => {
      state.stats.total = state.items.length;
      state.stats.completed = state.items.filter(item => item.completed).length;
      state.stats.active = state.stats.total - state.stats.completed;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.stats.total = state.items.length;
        state.stats.completed = state.items.filter(item => item.completed).length;
        state.stats.active = state.stats.total - state.stats.completed;
      })
      .addCase(loadTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveTodo.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveTodo.fulfilled, (state, action) => {
        state.loading = false;
        const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
        if (existingIndex >= 0) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.unshift(action.payload);
          state.stats.total++;
        }
      })
      .addCase(saveTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  addTodo,
  toggleTodo,
  removeTodo,
  updateTodo,
  setFilter,
  clearCompleted,
  markAllCompleted,
  updateStats
} = todoSlice.actions;

export default todoSlice.reducer;