<template>
  <div 
    class="vue-remote-app" 
    :style="themeStyles"
    :data-theme="theme.mode"
  >
    <header class="vue-remote-header">
      <h1>Vue Remote Micro-Frontend</h1>
      <p>Redux-powered Vue 3 component with global state sharing</p>
      <div v-if="user.isAuthenticated" class="user-welcome">
        Welcome, {{ user.currentUser?.username }}!
      </div>
    </header>

    <div class="redux-counter-section">
      <h2>Redux Counter Demo</h2>
      <div class="counter">
        <button @click="decrementCounter" class="counter-btn">-</button>
        <span class="count">{{ counter.value }}</span>
        <button @click="incrementCounter" class="counter-btn">+</button>
      </div>
      <div class="counter-controls">
        <div class="control-group">
          <label>Increment by: {{ counter.incrementBy }}</label>
          <input 
            type="range" 
            :value="counter.incrementBy"
            @input="counterDispatch(setIncrementBy(Number($event.target.value)))"
            min="1" 
            max="10"
            class="slider"
          />
        </div>
        <div class="control-group">
          <input
            type="number"
            v-model.number="customAmount"
            min="1"
            max="100"
            placeholder="Custom amount"
            class="number-input"
          />
          <button @click="addCustomAmount" class="action-btn">Add {{ customAmount }}</button>
        </div>
        <div class="action-buttons">
          <button @click="doubleCounter" class="action-btn">Double</button>
          <button @click="resetCounter" class="action-btn reset">Reset</button>
        </div>
      </div>
      <div class="counter-history">
        <h4>Action History (Last 3):</h4>
        <ul class="history-list">
          <li v-for="(action, index) in counter.history.slice(-3)" :key="index">
            <strong>{{ action.action }}</strong> → {{ action.value }}
            <small>({{ new Date(action.timestamp).toLocaleTimeString() }})</small>
          </li>
        </ul>
      </div>
    </div>

    <div class="theme-section">
      <h2>Theme Controls</h2>
      <div class="theme-controls">
        <div class="theme-modes">
          <button 
            @click="themeDispatch(setThemeMode('light'))"
            :class="['theme-btn', { active: theme.mode === 'light' }]"
          >
            ☀️ Light
          </button>
          <button 
            @click="themeDispatch(setThemeMode('dark'))"
            :class="['theme-btn', { active: theme.mode === 'dark' }]"
          >
            🌙 Dark
          </button>
          <button @click="toggleTheme" class="theme-btn">
            🔄 Toggle
          </button>
        </div>
        <div class="preset-buttons">
          <h4>Theme Presets:</h4>
          <button @click="applyThemePreset('vue')" class="preset-btn vue">Vue</button>
          <button @click="applyThemePreset('ocean')" class="preset-btn ocean">Ocean</button>
          <button @click="applyThemePreset('sunset')" class="preset-btn sunset">Sunset</button>
          <button @click="applyThemePreset('forest')" class="preset-btn forest">Forest</button>
        </div>
      </div>
    </div>

    <div class="user-section">
      <h2>User Management</h2>
      <div v-if="!user.isAuthenticated" class="login-section">
        <button @click="handleLogin" class="login-btn">Demo Login</button>
        <p>Simulate user authentication</p>
      </div>
      <div v-else class="user-info">
        <div class="user-details">
          <p><strong>Email:</strong> {{ user.currentUser?.email }}</p>
          <p><strong>Todos Created:</strong> {{ user.activity.todosCreated }}</p>
          <p><strong>Sessions:</strong> {{ user.activity.sessionsCount }}</p>
        </div>
        <div class="user-preferences">
          <label>
            <input
              type="checkbox"
              :checked="user.preferences.notifications"
              @change="userDispatch(updatePreferences({ notifications: $event.target.checked }))"
            />
            Enable Notifications
          </label>
          <label>
            <input
              type="checkbox"
              :checked="user.preferences.emailUpdates"
              @change="userDispatch(updatePreferences({ emailUpdates: $event.target.checked }))"
            />
            Email Updates
          </label>
        </div>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </div>

    <div class="redux-todo-section">
      <h2>Redux Todo List</h2>
      <div class="todo-actions">
        <input 
          v-model="newTodo" 
          @keyup.enter="handleAddTodo" 
          placeholder="Enter new task..."
          class="todo-input"
        />
        <button @click="handleAddTodo" class="add-btn">Add Todo</button>
      </div>
      
      <div class="todo-filters">
        <button 
          @click="setTodoFilter('all')"
          :class="['filter-btn', { active: todos.filter === 'all' }]"
        >
          All ({{ totalTodos }})
        </button>
        <button 
          @click="setTodoFilter('active')"
          :class="['filter-btn', { active: todos.filter === 'active' }]"
        >
          Active ({{ remainingCount }})
        </button>
        <button 
          @click="setTodoFilter('completed')"
          :class="['filter-btn', { active: todos.filter === 'completed' }]"
        >
          Completed ({{ completedCount }})
        </button>
      </div>

      <ul class="todo-list">
        <li 
          v-for="todo in filteredTodos" 
          :key="todo.id" 
          :class="['todo-item', { completed: todo.completed }]"
        >
          <input 
            type="checkbox" 
            :checked="todo.completed"
            @change="handleToggleTodo(todo.id)"
            class="todo-checkbox"
          />
          <div class="todo-content">
            <span class="todo-text">{{ todo.text }}</span>
            <span class="todo-priority" :class="todo.priority">{{ todo.priority }}</span>
          </div>
          <button @click="handleRemoveTodo(todo.id)" class="delete-btn">×</button>
        </li>
      </ul>
      
      <div class="todo-bulk-actions">
        <button @click="handleMarkAllCompleted" class="bulk-btn">Mark All Complete</button>
        <button @click="handleClearCompleted" class="bulk-btn">Clear Completed</button>
      </div>
      
      <div class="todo-stats">
        <span>Total: {{ totalTodos }}</span>
        <span>Completed: {{ completedCount }}</span>
        <span>Remaining: {{ remainingCount }}</span>
      </div>
    </div>

    <div class="features-section">
      <h2>Vue 3 Features Demo</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>Composition API</h3>
          <p>Modern reactive programming with setup()</p>
        </div>
        <div class="feature-card">
          <h3>Reactivity</h3>
          <p>Efficient reactive system with Proxy</p>
        </div>
        <div class="feature-card">
          <h3>Single File Components</h3>
          <p>Template, script, and style in one file</p>
        </div>
        <div class="feature-card">
          <h3>Module Federation</h3>
          <p>Micro-frontend architecture</p>
        </div>
      </div>
    </div>

    <DataVisualization />

    <SmartForm />

    <div class="tech-info">
      <h3>Technologies Used:</h3>
      <ul>
        <li>Vue 3</li>
        <li>Composition API</li>
        <li>Reactive Data Binding</li>
        <li>Computed Properties</li>
        <li>Watchers & Lifecycle Hooks</li>
        <li>Form Validation</li>
        <li>Webpack Module Federation</li>
        <li>CSS3 with modern features</li>
        <li>JavaScript ES6+</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useSelector, useDispatch, useCounter, useUser, useTheme, useTodos } from '../composables/useRedux';
import { increment, decrement, incrementByAmount, reset, setIncrementBy, doubleValue } from '../store/slices/counterSlice';
import { setThemeMode, applyPreset, toggleAnimations } from '../store/slices/themeSlice';
import { simulateLogin, clearUser, updatePreferences, incrementTodosCreated } from '../store/slices/userSlice';
import { addTodo, toggleTodo, removeTodo, setFilter, clearCompleted, markAllCompleted } from '../store/slices/todoSlice';
import DataVisualization from './DataVisualization.vue';
import SmartForm from './SmartForm.vue';

export default {
  name: 'VueRemoteApp',
  components: {
    DataVisualization,
    SmartForm
  },
  setup() {
    const { counter, dispatch: counterDispatch } = useCounter();
    const { user, dispatch: userDispatch } = useUser();
    const { theme, dispatch: themeDispatch } = useTheme();
    const { todos, filteredTodos, dispatch: todosDispatch } = useTodos();

    // Local state for new todo input
    const newTodo = ref('');
    const customAmount = ref(10);

    // Global state synchronization
    onMounted(() => {
      if (typeof window !== 'undefined') {
        // Listen for global state updates from other micro-frontends
        const handleGlobalStateUpdate = (event) => {
          if (event.detail) {
            switch (event.detail.type) {
              case 'GLOBAL_COUNTER_UPDATE':
                // Handle counter sync from other apps
                break;
              case 'GLOBAL_THEME_UPDATE':
                themeDispatch(setThemeMode(event.detail.payload.mode));
                break;
              case 'GLOBAL_USER_UPDATE':
                if (event.detail.payload.logout) {
                  userDispatch(clearUser());
                }
                break;
            }
          }
        };

        window.addEventListener('globalStateUpdate', handleGlobalStateUpdate);
        
        // Cleanup
        return () => {
          window.removeEventListener('globalStateUpdate', handleGlobalStateUpdate);
        };
      }
    });

    // Redux actions
    const incrementCounter = () => counterDispatch(increment());
    const decrementCounter = () => counterDispatch(decrement());
    const resetCounter = () => counterDispatch(reset());
    const doubleCounter = () => counterDispatch(doubleValue());
    const addCustomAmount = () => counterDispatch(incrementByAmount(customAmount.value));

    const handleAddTodo = () => {
      if (newTodo.value.trim()) {
        todosDispatch(addTodo({ 
          text: newTodo.value.trim(),
          priority: 'medium' 
        }));
        userDispatch(incrementTodosCreated());
        newTodo.value = '';
      }
    };

    const handleToggleTodo = (id) => todosDispatch(toggleTodo(id));
    const handleRemoveTodo = (id) => todosDispatch(removeTodo(id));
    const handleClearCompleted = () => todosDispatch(clearCompleted());
    const handleMarkAllCompleted = () => todosDispatch(markAllCompleted());

    const handleLogin = () => {
      userDispatch(simulateLogin({
        username: 'Vue User',
        email: 'demo@vue-remote.com'
      }));
    };

    const handleLogout = () => {
      userDispatch(clearUser());
      
      // Notify other micro-frontends
      if (typeof window !== 'undefined' && window.__GLOBAL_STATE_MANAGER__) {
        window.__GLOBAL_STATE_MANAGER__.dispatch({
          type: 'user/globalLogout',
          source: 'vue-remote'
        });
      }
    };

    const toggleTheme = () => {
      const newMode = theme.value.mode === 'light' ? 'dark' : 'light';
      themeDispatch(setThemeMode(newMode));
    };

    const applyThemePreset = (preset) => {
      themeDispatch(applyPreset(preset));
    };

    const setTodoFilter = (filter) => todosDispatch(setFilter(filter));

    // Computed properties
    const completedCount = computed(() => todos.value.stats.completed);
    const remainingCount = computed(() => todos.value.stats.active);
    const totalTodos = computed(() => todos.value.stats.total);

    const themeStyles = computed(() => ({
      '--primary-color': theme.value.primaryColor,
      '--secondary-color': theme.value.secondaryColor,
      '--accent-color': theme.value.accentColor,
      fontSize: theme.value.fontSize === 'small' ? '0.875rem' : 
                theme.value.fontSize === 'large' ? '1.125rem' : '1rem',
      borderRadius: theme.value.borderRadius === 'small' ? '4px' :
                   theme.value.borderRadius === 'large' ? '12px' : '8px'
    }));

    return {
      // Redux state
      counter,
      user,
      theme,
      todos,
      filteredTodos,
      
      // Local state
      newTodo,
      customAmount,
      
      // Actions
      incrementCounter,
      decrementCounter,
      resetCounter,
      doubleCounter,
      addCustomAmount,
      handleAddTodo,
      handleToggleTodo,
      handleRemoveTodo,
      handleClearCompleted,
      handleMarkAllCompleted,
      handleLogin,
      handleLogout,
      toggleTheme,
      applyThemePreset,
      setTodoFilter,
      
      // Computed
      completedCount,
      remainingCount,
      totalTodos,
      themeStyles
    };
  }
};
</script>

<style scoped>
.vue-remote-app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.vue-remote-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.vue-remote-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.vue-remote-header p {
  margin: 0;
  font-size: 1.2em;
  opacity: 0.9;
}

.counter-section,
.todo-section,
.features-section,
.tech-info {
  margin: 20px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.counter-section h2,
.todo-section h2,
.features-section h2,
.tech-info h3 {
  margin-top: 0;
  color: #fff;
  font-weight: 600;
}

.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.counter-btn {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: #fd79a8;
  color: white;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(253, 121, 168, 0.4);
}

.counter-btn:hover {
  background: #e84393;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(253, 121, 168, 0.6);
}

.counter-btn:active {
  transform: translateY(0);
}

.count {
  font-size: 3em;
  font-weight: bold;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  min-width: 80px;
  text-align: center;
}

.todo-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.todo-input {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  min-width: 200px;
}

.add-btn {
  background: #fdcb6e;
  color: #2d3436;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(253, 203, 110, 0.4);
}

.add-btn:hover {
  background: #f39c12;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(253, 203, 110, 0.6);
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin: 8px 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.todo-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.todo-item.completed {
  opacity: 0.7;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
}

.todo-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 16px;
}

.delete-btn {
  background: #e17055;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: #d63031;
  transform: scale(1.1);
}

.todo-stats {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 14px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  margin: 0 0 10px 0;
  color: #fdcb6e;
  font-size: 1.2em;
}

.feature-card p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.tech-info ul {
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;
}

.tech-info li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 14px;
}

.tech-info li:last-child {
  border-bottom: none;
}

.tech-info li:before {
  content: "✓ ";
  color: #fdcb6e;
  font-weight: bold;
  margin-right: 8px;
}

@media (max-width: 768px) {
  .vue-remote-app {
    margin: 10px;
    padding: 15px;
  }
  
  .vue-remote-header h1 {
    font-size: 2em;
  }
  
  .counter {
    gap: 15px;
  }
  
  .count {
    font-size: 2.5em;
  }
  
  .todo-actions {
    flex-direction: column;
  }
  
  .todo-input {
    min-width: 100%;
  }
}
</style>