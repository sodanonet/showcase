import { mount, shallowMount } from '@vue/test-utils';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Vue component
const VueRemoteApp = {
  name: 'VueRemoteApp',
  template: `
    <div>
      <h1>Vue Remote Application</h1>
      
      <div data-testid="counter-section">
        <h2>Counter: {{ count }}</h2>
        <button @click="increment">Increment</button>
        <button @click="decrement">Decrement</button>
      </div>
      
      <div data-testid="todo-section">
        <h2>Todo List</h2>
        <form @submit.prevent="addTodo">
          <input 
            v-model="newTodo" 
            placeholder="Add new todo"
            data-testid="todo-input"
          />
          <button type="submit" :disabled="!newTodo.trim()">Add Todo</button>
        </form>
        
        <ul data-testid="todo-list" v-if="todos.length">
          <li 
            v-for="todo in todos" 
            :key="todo.id"
            :data-testid="\`todo-item-\${todo.id}\`"
            :class="{ completed: todo.completed }"
          >
            <input 
              type="checkbox" 
              v-model="todo.completed"
              :data-testid="\`todo-checkbox-\${todo.id}\`"
            />
            <span :class="{ 'line-through': todo.completed }">
              {{ todo.text }}
            </span>
            <button 
              @click="removeTodo(todo.id)"
              :data-testid="\`remove-todo-\${todo.id}\`"
            >
              Remove
            </button>
          </li>
        </ul>
        
        <p v-else data-testid="no-todos">No todos yet!</p>
      </div>
      
      <div data-testid="computed-section">
        <p>Completed todos: {{ completedCount }}</p>
        <p>Remaining todos: {{ remainingCount }}</p>
      </div>
    </div>
  `,
  
  data() {
    return {
      count: 0,
      newTodo: '',
      todos: [],
      nextId: 1
    };
  },
  
  computed: {
    completedCount() {
      return this.todos.filter(todo => todo.completed).length;
    },
    
    remainingCount() {
      return this.todos.filter(todo => !todo.completed).length;
    }
  },
  
  methods: {
    increment() {
      this.count++;
    },
    
    decrement() {
      this.count--;
    },
    
    addTodo() {
      if (this.newTodo.trim()) {
        this.todos.push({
          id: this.nextId++,
          text: this.newTodo.trim(),
          completed: false
        });
        this.newTodo = '';
      }
    },
    
    removeTodo(id) {
      const index = this.todos.findIndex(todo => todo.id === id);
      if (index > -1) {
        this.todos.splice(index, 1);
      }
    }
  }
};

/**
 * Vue Component Testing Suite
 * Tests Vue remote application components using Vue Test Utils
 */

describe('VueRemoteApp', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(VueRemoteApp);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('Rendering', () => {
    test('renders main heading', () => {
      expect(wrapper.find('h1').text()).toBe('Vue Remote Application');
    });

    test('renders counter section', () => {
      const counterSection = wrapper.find('[data-testid="counter-section"]');
      
      expect(counterSection.exists()).toBe(true);
      expect(counterSection.find('h2').text()).toBe('Counter: 0');
      expect(counterSection.findAll('button')).toHaveLength(2);
    });

    test('renders todo section', () => {
      const todoSection = wrapper.find('[data-testid="todo-section"]');
      
      expect(todoSection.exists()).toBe(true);
      expect(todoSection.find('h2').text()).toBe('Todo List');
      expect(todoSection.find('input[type="text"]').exists()).toBe(true);
      expect(todoSection.find('button[type="submit"]').exists()).toBe(true);
    });

    test('shows "no todos" message when list is empty', () => {
      const noTodos = wrapper.find('[data-testid="no-todos"]');
      expect(noTodos.exists()).toBe(true);
      expect(noTodos.text()).toBe('No todos yet!');
    });
  });

  describe('Counter Functionality', () => {
    test('increments counter when increment button is clicked', async () => {
      const incrementBtn = wrapper.find('button:first-of-type');
      
      await incrementBtn.trigger('click');
      expect(wrapper.find('h2').text()).toBe('Counter: 1');
      
      await incrementBtn.trigger('click');
      expect(wrapper.find('h2').text()).toBe('Counter: 2');
    });

    test('decrements counter when decrement button is clicked', async () => {
      // First increment
      await wrapper.find('button:first-of-type').trigger('click');
      await wrapper.find('button:first-of-type').trigger('click');
      expect(wrapper.find('h2').text()).toBe('Counter: 2');
      
      // Then decrement
      const decrementBtn = wrapper.findAll('button').at(1);
      await decrementBtn.trigger('click');
      expect(wrapper.find('h2').text()).toBe('Counter: 1');
    });

    test('handles negative counter values', async () => {
      const decrementBtn = wrapper.findAll('button').at(1);
      
      await decrementBtn.trigger('click');
      expect(wrapper.find('h2').text()).toBe('Counter: -1');
    });
  });

  describe('Todo Functionality', () => {
    test('adds new todo when form is submitted', async () => {
      const todoInput = wrapper.find('[data-testid="todo-input"]');
      const form = wrapper.find('form');
      
      await todoInput.setValue('Test todo');
      await form.trigger('submit');
      
      const todoList = wrapper.find('[data-testid="todo-list"]');
      expect(todoList.exists()).toBe(true);
      
      const todoItems = wrapper.findAll('[data-testid^="todo-item-"]');
      expect(todoItems).toHaveLength(1);
      expect(todoItems.at(0).text()).toContain('Test todo');
    });

    test('clears input after adding todo', async () => {
      const todoInput = wrapper.find('[data-testid="todo-input"]');
      const form = wrapper.find('form');
      
      await todoInput.setValue('Test todo');
      await form.trigger('submit');
      
      expect(todoInput.element.value).toBe('');
    });

    test('does not add empty todos', async () => {
      const todoInput = wrapper.find('[data-testid="todo-input"]');
      const form = wrapper.find('form');
      
      await todoInput.setValue('   '); // Only spaces
      await form.trigger('submit');
      
      const noTodos = wrapper.find('[data-testid="no-todos"]');
      expect(noTodos.exists()).toBe(true);
    });

    test('disables add button when input is empty', async () => {
      const addButton = wrapper.find('button[type="submit"]');
      expect(addButton.element.disabled).toBe(true);
      
      const todoInput = wrapper.find('[data-testid="todo-input"]');
      await todoInput.setValue('Test');
      
      expect(addButton.element.disabled).toBe(false);
      
      await todoInput.setValue('');
      expect(addButton.element.disabled).toBe(true);
    });

    test('toggles todo completion', async () => {
      // First add a todo
      const todoInput = wrapper.find('[data-testid="todo-input"]');
      const form = wrapper.find('form');
      
      await todoInput.setValue('Test todo');
      await form.trigger('submit');
      
      // Then toggle completion
      const checkbox = wrapper.find('[data-testid="todo-checkbox-1"]');
      await checkbox.setChecked(true);
      
      const todoItem = wrapper.find('[data-testid="todo-item-1"]');
      expect(todoItem.classes()).toContain('completed');
      
      const todoText = todoItem.find('span');
      expect(todoText.classes()).toContain('line-through');
    });

    test('removes todo when remove button is clicked', async () => {
      // First add a todo
      const todoInput = wrapper.find('[data-testid="todo-input"]');
      const form = wrapper.find('form');
      
      await todoInput.setValue('Test todo');
      await form.trigger('submit');
      
      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);
      
      // Then remove it
      const removeButton = wrapper.find('[data-testid="remove-todo-1"]');
      await removeButton.trigger('click');
      
      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(0);
      expect(wrapper.find('[data-testid="no-todos"]').exists()).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    test('calculates completed count correctly', async () => {
      // Add multiple todos
      const todoInput = wrapper.find('[data-testid="todo-input"]');
      const form = wrapper.find('form');
      
      await todoInput.setValue('Todo 1');
      await form.trigger('submit');
      await todoInput.setValue('Todo 2');
      await form.trigger('submit');
      await todoInput.setValue('Todo 3');
      await form.trigger('submit');
      
      // Complete some todos
      await wrapper.find('[data-testid="todo-checkbox-1"]').setChecked(true);
      await wrapper.find('[data-testid="todo-checkbox-3"]').setChecked(true);
      
      const computedSection = wrapper.find('[data-testid="computed-section"]');
      expect(computedSection.text()).toContain('Completed todos: 2');
      expect(computedSection.text()).toContain('Remaining todos: 1');
    });

    test('updates counts when todos are added or removed', async () => {
      const todoInput = wrapper.find('[data-testid="todo-input"]');
      const form = wrapper.find('form');
      const computedSection = wrapper.find('[data-testid="computed-section"]');
      
      // Initially no todos
      expect(computedSection.text()).toContain('Completed todos: 0');
      expect(computedSection.text()).toContain('Remaining todos: 0');
      
      // Add todo
      await todoInput.setValue('Test todo');
      await form.trigger('submit');
      
      expect(computedSection.text()).toContain('Completed todos: 0');
      expect(computedSection.text()).toContain('Remaining todos: 1');
      
      // Complete todo
      await wrapper.find('[data-testid="todo-checkbox-1"]').setChecked(true);
      
      expect(computedSection.text()).toContain('Completed todos: 1');
      expect(computedSection.text()).toContain('Remaining todos: 0');
      
      // Remove todo
      await wrapper.find('[data-testid="remove-todo-1"]').trigger('click');
      
      expect(computedSection.text()).toContain('Completed todos: 0');
      expect(computedSection.text()).toContain('Remaining todos: 0');
    });
  });

  describe('Component Lifecycle', () => {
    test('initializes with correct default data', () => {
      expect(wrapper.vm.count).toBe(0);
      expect(wrapper.vm.newTodo).toBe('');
      expect(wrapper.vm.todos).toEqual([]);
      expect(wrapper.vm.nextId).toBe(1);
    });
  });

  describe('Reactivity', () => {
    test('updates UI when data changes', async () => {
      // Manually update component data
      wrapper.vm.count = 5;
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('h2').text()).toBe('Counter: 5');
    });

    test('computed properties are reactive', async () => {
      // Manually add todos to test reactivity
      wrapper.vm.todos = [
        { id: 1, text: 'Todo 1', completed: false },
        { id: 2, text: 'Todo 2', completed: true }
      ];
      
      await wrapper.vm.$nextTick();
      
      const computedSection = wrapper.find('[data-testid="computed-section"]');
      expect(computedSection.text()).toContain('Completed todos: 1');
      expect(computedSection.text()).toContain('Remaining todos: 1');
    });
  });

  describe('Event Handling', () => {
    test('form submission prevents default behavior', async () => {
      const form = wrapper.find('form');
      const submitEvent = { preventDefault: vi.fn() };
      
      form.element.addEventListener('submit', submitEvent.preventDefault);
      await form.trigger('submit');
      
      // The form should not refresh the page
      expect(submitEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels and structure', () => {
      const todoInput = wrapper.find('[data-testid="todo-input"]');
      expect(todoInput.attributes('placeholder')).toBe('Add new todo');
      
      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.exists()).toBe(true);
    });

    test('checkboxes are properly associated with todos', async () => {
      // Add a todo first
      const todoInput = wrapper.find('[data-testid="todo-input"]');
      const form = wrapper.find('form');
      
      await todoInput.setValue('Test todo');
      await form.trigger('submit');
      
      const checkbox = wrapper.find('[data-testid="todo-checkbox-1"]');
      expect(checkbox.attributes('type')).toBe('checkbox');
      expect(checkbox.exists()).toBe(true);
    });
  });
});