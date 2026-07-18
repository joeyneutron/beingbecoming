import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AdminPage from './AdminPage'
import './index.css'

const Root = window.location.pathname === '/admin' ? AdminPage : App

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
