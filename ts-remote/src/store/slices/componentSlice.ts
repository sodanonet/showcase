import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ComponentInstance {
  id: string;
  tagName: string;
  props: Record<string, any>;
  isConnected: boolean;
  createdAt: number;
  lastUpdated: number;
}

interface ComponentStatistics {
  totalInstances: number;
  connectedInstances: number;
  uniqueComponents: number;
  totalEvents: number;
  registeredDefinitions: number;
}

export interface ComponentState {
  instances: ComponentInstance[];
  registry: Record<string, ComponentDefinition>;
  activeComponents: string[];
  componentStyles: Record<string, ComponentStyles>;
  eventLog: ComponentEvent[];
  statistics: ComponentStatistics;
}

interface ComponentDefinition {
  tagName: string;
  className: string;
  attributes: string[];
  methods: string[];
  events: string[];
}

interface ComponentStyles {
  primary: string;
  secondary: string;
  background: string;
  border: string;
  shadow: string;
}

interface ComponentEvent {
  id: string;
  componentId: string;
  type: string;
  timestamp: number;
  data?: any;
}

const initialState: ComponentState = {
  instances: [],
  registry: {
    'my-button': {
      tagName: 'my-button',
      className: 'MyButton',
      attributes: ['text', 'variant', 'disabled'],
      methods: ['click', 'focus', 'blur'],
      events: ['click', 'focus', 'blur']
    },
    'my-input': {
      tagName: 'my-input',
      className: 'MyInput',
      attributes: ['value', 'placeholder', 'type', 'disabled'],
      methods: ['focus', 'blur', 'select'],
      events: ['input', 'change', 'focus', 'blur']
    },
    'my-card': {
      tagName: 'my-card',
      className: 'MyCard',
      attributes: ['title', 'elevated', 'color'],
      methods: ['expand', 'collapse'],
      events: ['expand', 'collapse', 'click']
    },
    'my-modal': {
      tagName: 'my-modal',
      className: 'MyModal',
      attributes: ['open', 'title', 'closable'],
      methods: ['open', 'close', 'toggle'],
      events: ['open', 'close', 'backdrop-click']
    }
  },
  activeComponents: [],
  componentStyles: {
    'my-button': {
      primary: '#007bff',
      secondary: '#6c757d',
      background: '#ffffff',
      border: '#007bff',
      shadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    'my-input': {
      primary: '#495057',
      secondary: '#6c757d',
      background: '#ffffff',
      border: '#ced4da',
      shadow: '0 0 0 0.2rem rgba(0,123,255,.25)'
    },
    'my-card': {
      primary: '#212529',
      secondary: '#6c757d',
      background: '#ffffff',
      border: '#dee2e6',
      shadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    'my-modal': {
      primary: '#212529',
      secondary: '#6c757d',
      background: '#ffffff',
      border: '#dee2e6',
      shadow: '0 10px 25px rgba(0,0,0,0.15)'
    }
  },
  eventLog: [],
  statistics: {
    totalInstances: 0,
    connectedInstances: 0,
    uniqueComponents: 0,
    totalEvents: 0,
    registeredDefinitions: 4
  }
};

const componentSlice = createSlice({
  name: 'components',
  initialState,
  reducers: {
    registerComponent: (state, action: PayloadAction<ComponentInstance>) => {
      const existing = state.instances.find(c => c.id === action.payload.id);
      if (!existing) {
        state.instances.push(action.payload);
        if (!state.activeComponents.includes(action.payload.tagName)) {
          state.activeComponents.push(action.payload.tagName);
        }
      }
    },
    
    unregisterComponent: (state, action: PayloadAction<string>) => {
      state.instances = state.instances.filter(c => c.id !== action.payload);
      
      // Remove from active if no instances left
      const remainingTagNames = new Set(state.instances.map(c => c.tagName));
      state.activeComponents = state.activeComponents.filter(tag => remainingTagNames.has(tag));
    },
    
    updateComponent: (state, action: PayloadAction<{ id: string; updates: Partial<ComponentInstance> }>) => {
      const component = state.instances.find(c => c.id === action.payload.id);
      if (component) {
        Object.assign(component, action.payload.updates, { lastUpdated: Date.now() });
      }
    },
    
    setComponentConnected: (state, action: PayloadAction<{ id: string; connected: boolean }>) => {
      const component = state.instances.find(c => c.id === action.payload.id);
      if (component) {
        component.isConnected = action.payload.connected;
        component.lastUpdated = Date.now();
      }
    },
    
    addComponentDefinition: (state, action: PayloadAction<ComponentDefinition>) => {
      state.registry[action.payload.tagName] = action.payload;
    },
    
    updateComponentStyles: (state, action: PayloadAction<{ tagName: string; styles: Partial<ComponentStyles> }>) => {
      if (state.componentStyles[action.payload.tagName]) {
        Object.assign(state.componentStyles[action.payload.tagName], action.payload.styles);
      } else {
        state.componentStyles[action.payload.tagName] = action.payload.styles as ComponentStyles;
      }
    },
    
    logComponentEvent: (state, action: PayloadAction<Omit<ComponentEvent, 'timestamp'>>) => {
      const event: ComponentEvent = {
        ...action.payload,
        timestamp: Date.now()
      };
      state.eventLog.unshift(event);
      
      // Keep only last 100 events
      if (state.eventLog.length > 100) {
        state.eventLog = state.eventLog.slice(0, 100);
      }
    },
    
    clearEventLog: (state) => {
      state.eventLog = [];
    },
    
    setGlobalComponentTheme: (state, action: PayloadAction<{ theme: 'light' | 'dark' | 'custom'; colors?: Record<string, string> }>) => {
      const { theme, colors } = action.payload;
      
      // Apply theme to all component styles
      Object.keys(state.componentStyles).forEach(tagName => {
        const styles = state.componentStyles[tagName];
        
        switch (theme) {
          case 'dark':
            styles.background = '#2d3748';
            styles.primary = '#e2e8f0';
            styles.secondary = '#a0aec0';
            styles.border = '#4a5568';
            break;
          case 'light':
            styles.background = '#ffffff';
            styles.primary = '#2d3748';
            styles.secondary = '#718096';
            styles.border = '#e2e8f0';
            break;
          case 'custom':
            if (colors) {
              Object.assign(styles, colors);
            }
            break;
        }
      });
    },
    
    updateComponentStats: (state) => {
      // Update computed statistics in state
      state.statistics = {
        totalInstances: state.instances.length,
        connectedInstances: state.instances.filter(c => c.isConnected).length,
        uniqueComponents: state.activeComponents.length,
        totalEvents: state.eventLog.length,
        registeredDefinitions: Object.keys(state.registry).length
      };
    }
  },
});

export const {
  registerComponent,
  unregisterComponent,
  updateComponent,
  setComponentConnected,
  addComponentDefinition,
  updateComponentStyles,
  logComponentEvent,
  clearEventLog,
  setGlobalComponentTheme,
  updateComponentStats
} = componentSlice.actions;

export default componentSlice.reducer;