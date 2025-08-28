import React, { useState } from 'react';
import './ReactRemoteApp.css';

const ReactRemoteApp = () => {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build micro-frontend', completed: true },
    { id: 3, text: 'Showcase skills', completed: false },
  ]);

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

  return (
    <div className="react-remote-app">
      <header className="react-remote-header">
        <h1>React Remote Micro-Frontend</h1>
        <p>This is a React component exposed via Module Federation</p>
      </header>
      
      <div className="counter-section">
        <h2>Counter Demo</h2>
        <div className="counter">
          <button onClick={() => setCount(count - 1)}>-</button>
          <span className="count">{count}</span>
          <button onClick={() => setCount(count + 1)}>+</button>
        </div>
      </div>

      <div className="todo-section">
        <h2>Todo List Demo</h2>
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
          <li>Webpack Module Federation</li>
          <li>CSS3</li>
          <li>JavaScript ES6+</li>
        </ul>
      </div>
    </div>
  );
};

export default ReactRemoteApp;