import React from 'react';
import { Provider } from 'react-redux';
import ReactRemoteApp from './components/ReactRemoteApp';
import store from './store';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <ReactRemoteApp />
      </div>
    </Provider>
  );
}

export default App;
