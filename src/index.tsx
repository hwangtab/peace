import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n/config';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Only measure performance in development
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  reportWebVitals(console.log);
}
