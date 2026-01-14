import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import './index.css';
import '@xyflow/react/dist/style.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("FATAL: Could not find root element to mount to. Check index.html.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
