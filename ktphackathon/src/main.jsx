import React from 'react'
import ReactDOM from 'react-dom/client'
import AppWrapper from './App.jsx'
import './index.css' // Make sure TailwindCSS styles are imported

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
)