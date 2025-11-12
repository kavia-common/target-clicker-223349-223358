import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Honor prefers-reduced-motion by toggling a data attribute if needed
try {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) {
    document.documentElement.setAttribute('data-reduced-motion', 'true');
  }
} catch {
  // ignore if not supported
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
