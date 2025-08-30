import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk using modern ES2022+ features
export const fetchModernData = createAsyncThunk(
  'modernJs/fetchData',
  async (params, { rejectWithValue, signal }) => {
    try {
      // Using optional chaining and nullish coalescing
      const url = params?.url ?? '/api/modern-data';
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...params?.headers
        },
        signal // AbortController support
      };

      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        return rejectWithValue('Request was cancelled');
      }
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // ES2022 Private Fields demonstration (simulated in Redux state)
  privateData: {
    #secret: 'This is private data',
    publicValue: 42
  },
  
  // Modern JS collections
  sets: new Set(['item1', 'item2', 'item3']),
  maps: new Map([
    ['key1', 'value1'],
    ['key2', 'value2']
  ]),
  
  // Async operations
  asyncData: null,
  loading: false,
  error: null,
  
  // Modern syntax demonstrations
  destructuredData: {
    user: { name: 'John', age: 30, city: 'NYC' },
    preferences: { theme: 'dark', language: 'en' }
  },
  
  // Array methods and functional programming
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  processedNumbers: {
    filtered: [],
    mapped: [],
    reduced: 0
  },
  
  // Promises and async patterns
  promiseStates: {
    pending: [],
    fulfilled: [],
    rejected: []
  },
  
  // Modern class features (simulated)
  classInstances: [],
  
  // Template literals and tagged templates
  templates: {
    simple: '',
    tagged: '',
    interpolated: ''
  }
};

const modernJsSlice = createSlice({
  name: 'modernJs',
  initialState: {
    ...initialState,
    sets: Array.from(initialState.sets), // Convert Set to Array for Redux serialization
    maps: Array.from(initialState.maps) // Convert Map to Array
  },
  reducers: {
    // Demonstrate destructuring and spread operator
    updateUserData: (state, action) => {
      const { user, preferences, ...otherData } = action.payload;
      
      // Using spread operator to merge objects
      state.destructuredData = {
        ...state.destructuredData,
        ...(user && { user: { ...state.destructuredData.user, ...user } }),
        ...(preferences && { preferences: { ...state.destructuredData.preferences, ...preferences } }),
        ...otherData
      };
    },
    
    // Array methods demonstration
    processNumbers: (state, action) => {
      const { operation } = action.payload;
      
      switch (operation) {
        case 'filter':
          // Filter even numbers
          state.processedNumbers.filtered = state.numbers.filter(num => num % 2 === 0);
          break;
          
        case 'map':
          // Square all numbers
          state.processedNumbers.mapped = state.numbers.map(num => num ** 2);
          break;
          
        case 'reduce':
          // Sum all numbers
          state.processedNumbers.reduced = state.numbers.reduce((acc, num) => acc + num, 0);
          break;
          
        case 'chain':
          // Chain multiple operations
          const result = state.numbers
            .filter(num => num > 5)
            .map(num => num * 2)
            .reduce((acc, num) => acc + num, 0);
          state.processedNumbers.chained = result;
          break;
      }
    },
    
    // Set operations (simulated with arrays)
    updateSet: (state, action) => {
      const { operation, value } = action.payload;
      const setArray = state.sets;
      
      switch (operation) {
        case 'add':
          if (!setArray.includes(value)) {
            setArray.push(value);
          }
          break;
          
        case 'delete':
          const index = setArray.indexOf(value);
          if (index > -1) {
            setArray.splice(index, 1);
          }
          break;
          
        case 'clear':
          state.sets = [];
          break;
      }
    },
    
    // Map operations (simulated with arrays)
    updateMap: (state, action) => {
      const { operation, key, value } = action.payload;
      const mapArray = state.maps;
      
      switch (operation) {
        case 'set':
          const existingIndex = mapArray.findIndex(([k, v]) => k === key);
          if (existingIndex > -1) {
            mapArray[existingIndex] = [key, value];
          } else {
            mapArray.push([key, value]);
          }
          break;
          
        case 'delete':
          const deleteIndex = mapArray.findIndex(([k, v]) => k === key);
          if (deleteIndex > -1) {
            mapArray.splice(deleteIndex, 1);
          }
          break;
          
        case 'clear':
          state.maps = [];
          break;
      }
    },
    
    // Template literal demonstration
    generateTemplates: (state, action) => {
      const { name, value, items } = action.payload;
      
      // Simple template literal
      state.templates.simple = `Hello, ${name}! Your value is ${value}.`;
      
      // Multiline template
      state.templates.multiline = `
        Welcome ${name},
        Your current value: ${value}
        Generated at: ${new Date().toISOString()}
      `.trim();
      
      // Complex interpolation
      state.templates.interpolated = `
        ${name.toUpperCase()}, you have ${items?.length ?? 0} items:
        ${items?.map((item, index) => `  ${index + 1}. ${item}`).join('\n') ?? 'No items'}
      `.trim();
    },
    
    // Class simulation with modern features
    createClassInstance: (state, action) => {
      const { type, data } = action.payload;
      
      // Simulate class instance with private fields
      const instance = {
        id: Date.now().toString(),
        type,
        data,
        // Simulated private fields
        _private: {
          created: Date.now(),
          secret: Math.random().toString(36)
        },
        // Public methods (simulated)
        getPublicData: () => data,
        toString: () => `${type}Instance(${instance.id})`
      };
      
      state.classInstances.push({
        id: instance.id,
        type: instance.type,
        data: instance.data,
        created: instance._private.created
      });
    },
    
    // Promise state tracking
    addPromiseState: (state, action) => {
      const { id, status, result, error } = action.payload;
      
      // Remove from other arrays first
      ['pending', 'fulfilled', 'rejected'].forEach(statusKey => {
        state.promiseStates[statusKey] = state.promiseStates[statusKey].filter(p => p.id !== id);
      });
      
      // Add to appropriate array
      const promiseData = { id, timestamp: Date.now() };
      
      switch (status) {
        case 'pending':
          state.promiseStates.pending.push(promiseData);
          break;
        case 'fulfilled':
          state.promiseStates.fulfilled.push({ ...promiseData, result });
          break;
        case 'rejected':
          state.promiseStates.rejected.push({ ...promiseData, error });
          break;
      }
    },
    
    // Async/await pattern demonstration
    simulateAsyncOperation: (state, action) => {
      const { operationId } = action.payload;
      
      // Mark as pending
      modernJsSlice.caseReducers.addPromiseState(state, {
        payload: { id: operationId, status: 'pending' }
      });
    },
    
    // Nullish coalescing and optional chaining demo
    safeDataAccess: (state, action) => {
      const data = action.payload;
      
      // Using nullish coalescing operator (??)
      const result = {
        name: data?.user?.name ?? 'Unknown',
        email: data?.user?.email ?? 'No email',
        preferences: data?.user?.preferences ?? {},
        count: data?.stats?.count ?? 0,
        
        // Optional chaining with method calls
        formattedName: data?.user?.name?.toUpperCase?.() ?? 'UNKNOWN',
        
        // Complex nested access
        deepValue: data?.deeply?.nested?.value?.property ?? 'default'
      };
      
      state.safeAccessResult = result;
    },
    
    clearModernJsState: (state) => {
      return {
        ...initialState,
        sets: [],
        maps: []
      };
    }
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(fetchModernData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModernData.fulfilled, (state, action) => {
        state.loading = false;
        state.asyncData = action.payload;
      })
      .addCase(fetchModernData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  updateUserData,
  processNumbers,
  updateSet,
  updateMap,
  generateTemplates,
  createClassInstance,
  addPromiseState,
  simulateAsyncOperation,
  safeDataAccess,
  clearModernJsState
} = modernJsSlice.actions;

export { fetchModernData };

export default modernJsSlice.reducer;