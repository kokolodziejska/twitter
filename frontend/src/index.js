import React from 'react';
import ReactDOM from 'react-dom/client';
import '../src/style/index.css';
import App from './App';
import reportWebVitals from './components/configurations/reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
    <App />
  </React.StrictMode>
);

reportWebVitals();
