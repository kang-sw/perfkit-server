import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.tsx';
import '../node_modules/bootstrap/dist/js/bootstrap.esm'
import '../node_modules/bootstrap/dist/css/bootstrap.css'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

