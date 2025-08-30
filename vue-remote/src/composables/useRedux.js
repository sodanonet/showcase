import { ref, computed, onMounted, onUnmounted } from 'vue';
import store from '../store';

// Vue 3 composable for Redux integration
export function useSelector(selector) {
  const selectedState = ref(selector(store.getState()));
  
  let unsubscribe;
  
  onMounted(() => {
    unsubscribe = store.subscribe(() => {
      selectedState.value = selector(store.getState());
    });
  });
  
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
  
  return computed(() => selectedState.value);
}

export function useDispatch() {
  return store.dispatch;
}

// Composable for counter state
export function useCounter() {
  const counter = useSelector(state => state.counter);
  const dispatch = useDispatch();
  
  return {
    counter,
    dispatch
  };
}

// Composable for user state
export function useUser() {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  
  return {
    user,
    dispatch
  };
}

// Composable for theme state
export function useTheme() {
  const theme = useSelector(state => state.theme);
  const dispatch = useDispatch();
  
  return {
    theme,
    dispatch
  };
}

// Composable for todos state
export function useTodos() {
  const todos = useSelector(state => state.todos);
  const dispatch = useDispatch();
  
  const filteredTodos = computed(() => {
    const filter = todos.value.filter;
    const items = todos.value.items;
    
    switch (filter) {
      case 'active':
        return items.filter(todo => !todo.completed);
      case 'completed':
        return items.filter(todo => todo.completed);
      default:
        return items;
    }
  });
  
  return {
    todos,
    filteredTodos,
    dispatch
  };
}