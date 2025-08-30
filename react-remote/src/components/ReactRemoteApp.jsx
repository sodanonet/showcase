import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, incrementByAmount, reset, setIncrementBy } from '../store/slices/counterSlice';
import { setThemeMode, setPrimaryColor, toggleAnimations } from '../store/slices/themeSlice';
import { setUser, updatePreferences, loginUser, logoutUser } from '../store/slices/userSlice';
import './ReactRemoteApp.css';

const ReactRemoteApp = () => {
  const dispatch = useDispatch();
  const counter = useSelector(state => state.counter);
  const theme = useSelector(state => state.theme);
  const user = useSelector(state => state.user);
  
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build micro-frontend', completed: true },
    { id: 3, text: 'Showcase skills', completed: false },
  ]);
  const [customAmount, setCustomAmount] = useState(5);

  // Global state synchronization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Listen for global state updates
      const handleGlobalStateUpdate = (event) => {
        if (event.detail && event.detail.type === 'GLOBAL_COUNTER_UPDATE') {
          // Sync counter from global state
          // This will be implemented when shell-vue is ready
        }
      };

      window.addEventListener('globalStateUpdate', handleGlobalStateUpdate);
      
      return () => {
        window.removeEventListener('globalStateUpdate', handleGlobalStateUpdate);
      };
    }
  }, [dispatch]);

  const addTodo = () => {
    const newTodo = {
      id: Date.now(),
      text: `New task ${todos.length + 1}`,
      completed: false,
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleLogin = async () => {
    await dispatch(loginUser({
      email: 'demo@react-remote.com',
      password: 'demopassword'
    }));
  };

  return (
    <div 
      className="react-remote-app"
      style={{
        '--primary-color': theme.primaryColor,
        '--secondary-color': theme.secondaryColor,
        fontSize: theme.fontSize === 'small' ? '0.875rem' : theme.fontSize === 'large' ? '1.125rem' : '1rem'
      }}
      data-theme={theme.mode}
    >
      <header className="react-remote-header">
        <h1>React Remote Micro-Frontend</h1>
        <p>Redux-powered component with global state sharing</p>
        {user.isAuthenticated && (
          <p>Welcome, {user.currentUser?.username || 'User'}!</p>
        )}
      </header>
      
      <div className="redux-counter-section">
        <h2>Redux Counter Demo</h2>
        <div className="counter">
          <button onClick={() => dispatch(decrement())}>-</button>
          <span className="count">{counter.value}</span>
          <button onClick={() => dispatch(increment())}>+</button>
        </div>
        <div className="counter-controls">
          <label>
            Increment by: 
            <input 
              type="number" 
              value={counter.incrementBy}
              onChange={(e) => dispatch(setIncrementBy(Number(e.target.value)))}
              min="1"
              max="10"
            />
          </label>
          <button onClick={() => dispatch(incrementByAmount(customAmount))}>
            Add {customAmount}
          </button>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(Number(e.target.value))}
            min="1"
            max="100"
          />
          <button onClick={() => dispatch(reset())}>Reset</button>
        </div>
        <div className="counter-history">
          <h4>Action History:</h4>
          <ul>
            {counter.history.slice(-3).map((action, index) => (
              <li key={index}>
                {action.action} → {action.value} 
                <small> ({new Date(action.timestamp).toLocaleTimeString()})</small>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="theme-controls">
        <h3>Theme Controls</h3>
        <div className="theme-buttons">
          <button 
            onClick={() => dispatch(setThemeMode('light'))}
            className={theme.mode === 'light' ? 'active' : ''}
          >
            Light
          </button>
          <button 
            onClick={() => dispatch(setThemeMode('dark'))}
            className={theme.mode === 'dark' ? 'active' : ''}
          >
            Dark
          </button>
          <button onClick={() => dispatch(toggleAnimations())}>
            {theme.animations ? 'Disable' : 'Enable'} Animations
          </button>
        </div>
        <div className="color-controls">
          <label>
            Primary Color:
            <input
              type="color"
              value={theme.primaryColor}
              onChange={(e) => dispatch(setPrimaryColor(e.target.value))}
            />
          </label>
        </div>
      </div>

      <div className="user-controls">
        <h3>User Management</h3>
        {!user.isAuthenticated ? (
          <div>
            <button onClick={handleLogin}>Demo Login</button>
            <p>Click to simulate user login</p>
          </div>
        ) : (
          <div>
            <p>Logged in as: {user.currentUser?.email}</p>
            <button onClick={() => dispatch(logoutUser())}>Logout</button>
            <div className="preferences">
              <label>
                <input
                  type="checkbox"
                  checked={user.preferences.notifications}
                  onChange={(e) => dispatch(updatePreferences({ notifications: e.target.checked }))}
                />
                Enable Notifications
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="todo-section">
        <h2>Local Todo List</h2>
        <div className="todo-actions">
          <button onClick={addTodo}>Add Todo</button>
        </div>
        <ul className="todo-list">
          {todos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span>{todo.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="tech-info">
        <h3>Technologies Used:</h3>
        <ul>
          <li>React 19</li>
          <li>Redux Toolkit</li>
          <li>React Redux</li>
          <li>Webpack Module Federation</li>
          <li>CSS3 with CSS Variables</li>
          <li>JavaScript ES6+</li>
        </ul>
      </div>

      <div className="state-debug">
        <h4>Redux State Debug:</h4>
        <details>
          <summary>Counter State</summary>
          <pre>{JSON.stringify(counter, null, 2)}</pre>
        </details>
        <details>
          <summary>Theme State</summary>
          <pre>{JSON.stringify(theme, null, 2)}</pre>
        </details>
        <details>
          <summary>User State</summary>
          <pre>{JSON.stringify({ ...user, currentUser: user.currentUser ? '***' : null }, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

export default ReactRemoteApp;