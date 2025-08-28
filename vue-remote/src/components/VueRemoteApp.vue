<template>
  <div class="vue-remote-app">
    <header class="vue-remote-header">
      <h1>Vue Remote Micro-Frontend</h1>
      <p>This is a Vue 3 component exposed via Module Federation</p>
    </header>

    <div class="counter-section">
      <h2>Counter Demo</h2>
      <div class="counter">
        <button @click="decrementCounter" class="counter-btn">-</button>
        <span class="count">{{ counter }}</span>
        <button @click="incrementCounter" class="counter-btn">+</button>
      </div>
    </div>

    <div class="todo-section">
      <h2>Todo List Demo</h2>
      <div class="todo-actions">
        <input 
          v-model="newTodo" 
          @keyup.enter="addTodo" 
          placeholder="Enter new task..."
          class="todo-input"
        />
        <button @click="addTodo" class="add-btn">Add Todo</button>
      </div>
      <ul class="todo-list">
        <li 
          v-for="todo in todos" 
          :key="todo.id" 
          :class="['todo-item', { completed: todo.completed }]"
        >
          <input 
            type="checkbox" 
            v-model="todo.completed" 
            class="todo-checkbox"
          />
          <span class="todo-text">{{ todo.text }}</span>
          <button @click="deleteTodo(todo.id)" class="delete-btn">×</button>
        </li>
      </ul>
      <div class="todo-stats">
        <span>Total: {{ todos.length }}</span>
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
import { ref, computed } from 'vue';
import DataVisualization from './DataVisualization.vue';
import SmartForm from './SmartForm.vue';

export default {
  name: 'VueRemoteApp',
  components: {
    DataVisualization,
    SmartForm
  },
  setup() {
    // Counter functionality
    const counter = ref(0);
    
    const incrementCounter = () => {
      counter.value++;
    };
    
    const decrementCounter = () => {
      counter.value--;
    };

    // Todo functionality
    const newTodo = ref('');
    const todos = ref([
      { id: 1, text: 'Learn Vue 3', completed: true },
      { id: 2, text: 'Build micro-frontend', completed: true },
      { id: 3, text: 'Showcase Vue skills', completed: false },
      { id: 4, text: 'Implement Composition API', completed: false }
    ]);

    const addTodo = () => {
      if (newTodo.value.trim()) {
        todos.value.push({
          id: Date.now(),
          text: newTodo.value.trim(),
          completed: false
        });
        newTodo.value = '';
      }
    };

    const deleteTodo = (id) => {
      todos.value = todos.value.filter(todo => todo.id !== id);
    };

    const completedCount = computed(() => {
      return todos.value.filter(todo => todo.completed).length;
    });

    const remainingCount = computed(() => {
      return todos.value.filter(todo => !todo.completed).length;
    });

    return {
      counter,
      incrementCounter,
      decrementCounter,
      newTodo,
      todos,
      addTodo,
      deleteTodo,
      completedCount,
      remainingCount
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